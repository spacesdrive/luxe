const getItemProductId = (item) => {
    return (item.product || item.id || "").toString();
};

export const getCartProducts = async (c) => {
    try {
        const { Product } = c.get("models");
        const user = c.get("user");
        const productIds = user.cartItems
            .map((item) => item.product || item.id)
            .filter(Boolean);

        const products = await Product.find({ _id: { $in: productIds } });

        const cartItems = user.cartItems.map((cartItem) => {
            const cartProductId = getItemProductId(cartItem);
            const product = products.find((p) => p._id.toString() === cartProductId);
            if (!product) return null;
            return {
                ...product.toJSON(),
                quantity: cartItem.quantity,
                selectedSize: cartItem.selectedSize || null,
            };
        }).filter(Boolean);

        return c.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const addToCart = async (c) => {
    try {
        const { productId, selectedSize } = await c.req.json();
        const user = c.get("user");

        const existingItem = user.cartItems.find(
            (item) =>
                getItemProductId(item) === productId &&
                (item.selectedSize || null) === (selectedSize || null)
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1, selectedSize: selectedSize || null });
        }

        await user.save();
        return c.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const removeAllFromCart = async (c) => {
    try {
        const { productId, selectedSize } = await c.req.json();
        const user = c.get("user");

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(
                (item) =>
                    !(
                        getItemProductId(item) === productId &&
                        (item.selectedSize || null) === (selectedSize || null)
                    )
            );
        }

        await user.save();
        return c.json(user.cartItems);
    } catch (error) {
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

export const updateQuantity = async (c) => {
    try {
        const productId = c.req.param("id");
        const { quantity, selectedSize } = await c.req.json();
        const user = c.get("user");

        const existingItem = user.cartItems.find(
            (item) =>
                getItemProductId(item) === productId &&
                (item.selectedSize || null) === (selectedSize || null)
        );

        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(
                    (item) =>
                        !(
                            getItemProductId(item) === productId &&
                            (item.selectedSize || null) === (selectedSize || null)
                        )
                );
                await user.save();
                return c.json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            return c.json(user.cartItems);
        }

        return c.json({ message: "Product not found" }, 404);
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};
