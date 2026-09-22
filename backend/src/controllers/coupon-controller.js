// Get the active coupon for the currently logged-in user
export const getCoupon = async (c) => {
    try {
        const { Coupon } = c.get("models");
        const user = c.get("user");
        const coupon = await Coupon.findOne({ userId: user._id, isActive: true });
        return c.json(coupon || null);
    } catch (error) {
        console.log("Error in getCoupon controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

// Validate a coupon code for the current user and check if it's still active and not expired
export const validateCoupon = async (c) => {
    try {
        const { Coupon } = c.get("models");
        const { code } = await c.req.json();
        const user = c.get("user");
        const coupon = await Coupon.findOne({ code: code, userId: user._id, isActive: true });

        if (!coupon) {
            return c.json({ message: "Coupon not found" }, 404);
        }

        // Deactivate the coupon if it has passed its expiration date
        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return c.json({ message: "Coupon expired" }, 404);
        }

        return c.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.log("Error in validateCoupon controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};
