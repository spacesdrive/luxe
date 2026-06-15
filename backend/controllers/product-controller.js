import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product-model.js";
import { generateProductEmbedding } from "../services/embedding-service.js";
import { upsertProductVector, deleteProductVector } from "../services/pinecone-service.js";

const scheduleEmbeddingUpsert = (product) => {
    setImmediate(async () => {
        try {
            const embedding = await generateProductEmbedding(product);
            await upsertProductVector(product._id, embedding, {
                name: product.name,
                category: product.category,
                price: product.price,
            });
        } catch (err) {
            console.error(`Embedding upsert failed for product ${product._id}:`, err.message);
        }
    });
};

const scheduleEmbeddingDelete = (productId) => {
    setImmediate(async () => {
        try {
            await deleteProductVector(productId);
        } catch (err) {
            console.error(`Embedding delete failed for product ${productId}:`, err.message);
        }
    });
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }

        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.log("Error in getProductById controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        res.json({ products });
    } catch (error) {
        console.log("Error in getPublicProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, sizes, shoeSizes } = req.body;

        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
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

        scheduleEmbeddingUpsert(product);

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Deleted image from Cloudinary");
            } catch (error) {
                console.log("Error deleting image from Cloudinary", error);
            }
        }

        scheduleEmbeddingDelete(product._id);

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
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

        res.json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category: { $regex: new RegExp(`^${category}$`, "i") } });
        res.json({ products });
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const { name, description, price, image, category, sizes, shoeSizes } = req.body;

        let newImageUrl = product.image;
        if (image && image !== product.image) {
            if (product.image) {
                const publicId = product.image.split("/").pop().split(".")[0];
                try {
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                } catch (error) {
                    console.log("Error deleting old image from Cloudinary", error);
                }
            }

            const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
            newImageUrl = cloudinaryResponse.secure_url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
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

        scheduleEmbeddingUpsert(updatedProduct);

        res.json(updatedProduct);
    } catch (error) {
        console.log("Error in updateProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache function", error);
    }
}