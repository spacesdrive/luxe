import { getRedis } from "../lib/redis.js";
import { uploadImage, destroyImage } from "../lib/cloudinary.js";
import { generateProductEmbedding } from "../services/embedding-service.js";
import { upsertProductVector, deleteProductVector } from "../services/pinecone-service.js";

const scheduleEmbeddingUpsert = (c, product) => {
    c.executionCtx.waitUntil(
        (async () => {
            try {
                const embedding = await generateProductEmbedding(c.env, product);
                await upsertProductVector(c.env, product._id, embedding, {
                    name: product.name,
                    category: product.category,
                    price: product.price,
                });
            } catch (err) {
                console.error(`Embedding upsert failed for product ${product._id}:`, err.message);
            }
        })()
    );
};

const scheduleEmbeddingDelete = (c, productId) => {
    c.executionCtx.waitUntil(
        deleteProductVector(c.env, productId).catch((err) => {
            console.error(`Embedding delete failed for product ${productId}:`, err.message);
        })
    );
};

export const getAllProducts = async (c) => {
    try {
        const { Product } = c.get("models");
        const products = await Product.find({});
        return c.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const getFeaturedProducts = async (c) => {
    try {
        const { Product } = c.get("models");
        let featuredProducts = await getRedis(c.env).get("featured_products");
        if (featuredProducts) {
            return c.json(JSON.parse(featuredProducts));
        }

        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return c.json({ message: "No featured products found" }, 404);
        }

        await getRedis(c.env).set("featured_products", JSON.stringify(featuredProducts));

        return c.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const getProductById = async (c) => {
    try {
        const { Product } = c.get("models");
        const product = await Product.findById(c.req.param("id"));
        if (!product) {
            return c.json({ message: "Product not found" }, 404);
        }
        return c.json(product);
    } catch (error) {
        console.log("Error in getProductById controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const getPublicProducts = async (c) => {
    try {
        const { Product } = c.get("models");
        const products = await Product.find({}).lean();
        return c.json({ products });
    } catch (error) {
        console.log("Error in getPublicProducts controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const createProduct = async (c) => {
    try {
        const { Product } = c.get("models");
        const { name, description, price, image, category, sizes, shoeSizes } = await c.req.json();

        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await uploadImage(c.env, image, { folder: "products" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category,
            sizes: sizes || [],
            shoeSizes: shoeSizes || [],
        });

        scheduleEmbeddingUpsert(c, product);

        return c.json(product, 201);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const deleteProduct = async (c) => {
    try {
        const { Product } = c.get("models");
        const id = c.req.param("id");
        const product = await Product.findById(id);

        if (!product) {
            return c.json({ message: "Product not found" }, 404);
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await destroyImage(c.env, `products/${publicId}`);
                console.log("Deleted image from Cloudinary");
            } catch (error) {
                console.log("Error deleting image from Cloudinary", error);
            }
        }

        scheduleEmbeddingDelete(c, product._id);

        await Product.findByIdAndDelete(id);

        return c.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const getRecommendedProducts = async (c) => {
    try {
        const { Product } = c.get("models");
        const products = await Product.aggregate([
            { $sample: { size: 4 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                    category: 1,
                    isFeatured: 1,
                    sizes: 1,
                    shoeSizes: 1,
                },
            },
        ]);

        return c.json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const getProductsByCategory = async (c) => {
    const category = c.req.param("category");
    try {
        const { Product } = c.get("models");
        const products = await Product.find({ category: { $regex: new RegExp(`^${category}$`, "i") } });
        return c.json({ products });
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const updateProduct = async (c) => {
    try {
        const { Product } = c.get("models");
        const id = c.req.param("id");
        const product = await Product.findById(id);

        if (!product) {
            return c.json({ message: "Product not found" }, 404);
        }

        const { name, description, price, image, category, sizes, shoeSizes } = await c.req.json();

        let newImageUrl = product.image;
        if (image && image !== product.image) {
            if (product.image) {
                const publicId = product.image.split("/").pop().split(".")[0];
                try {
                    await destroyImage(c.env, `products/${publicId}`);
                } catch (error) {
                    console.log("Error deleting old image from Cloudinary", error);
                }
            }

            const cloudinaryResponse = await uploadImage(c.env, image, { folder: "products" });
            newImageUrl = cloudinaryResponse.secure_url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: name ?? product.name,
                description: description ?? product.description,
                price: price ?? product.price,
                image: newImageUrl,
                category: category ?? product.category,
                sizes: sizes ?? product.sizes,
                shoeSizes: shoeSizes ?? product.shoeSizes,
            },
            { new: true }
        );

        scheduleEmbeddingUpsert(c, updatedProduct);

        return c.json(updatedProduct);
    } catch (error) {
        console.log("Error in updateProduct controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const toggleFeaturedProduct = async (c) => {
    try {
        const { Product } = c.get("models");
        const product = await Product.findById(c.req.param("id"));
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache(c.env, Product);
            return c.json(updatedProduct);
        }
        return c.json({ message: "Product not found" }, 404);
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

async function updateFeaturedProductsCache(env, Product) {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await getRedis(env).set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache function", error);
    }
}
