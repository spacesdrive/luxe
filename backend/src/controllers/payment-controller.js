import { getStripe } from "../lib/stripe.js";

// Resolve the frontend URL for Stripe redirect URLs
const getClientUrl = (env) => env.FRONTEND_URL || "http://localhost:5173";

// Create a Stripe checkout session for the given products and optional coupon
export const createCheckoutSession = async (c) => {
    try {
        const { Coupon } = c.get("models");
        const { products, couponCode } = await c.req.json();
        const user = c.get("user");
        const stripe = getStripe(c.env);

        if (!Array.isArray(products) || products.length === 0) {
            return c.json({ error: "Invalid or empty products array" }, 400);
        }

        let totalAmount = 0;

        // Build Stripe line items and calculate total (in cents)
        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

        // Apply coupon discount if a valid coupon code was provided
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
            }
        }

        const clientUrl = getClientUrl(c.env);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${clientUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/purchase-cancel`,
            discounts: coupon
                ? [
                    {
                        coupon: await createStripeCoupon(stripe, coupon.discountPercentage),
                    },
                ]
                : [],
            // Store order metadata in the session for retrieval on success
            metadata: {
                userId: user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        // Reward the user with a new coupon if their order total is $200 or more
        if (totalAmount >= 20000) {
            await createNewCoupon(Coupon, user._id);
        }

        // Return both the session id AND the url so frontend can redirect directly
        return c.json({ id: session.id, url: session.url, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.error("Error processing checkout:", error);
        return c.json({ message: "Error processing checkout", error: error.message }, 500);
    }
};

// Handle a successful Stripe checkout: deactivate used coupon and create the order
export const checkoutSuccess = async (c) => {
    try {
        const { Coupon, Order } = c.get("models");
        const { sessionId } = await c.req.json();
        const stripe = getStripe(c.env);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            // Deactivate the coupon if one was used in this session
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadata.couponCode,
                        userId: session.metadata.userId,
                    },
                    {
                        isActive: false,
                    }
                );
            }

            // Create a new order record from the session metadata
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map((product) => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price,
                })),
                totalAmount: session.amount_total / 100,
                stripeSessionId: sessionId,
            });

            await newOrder.save();

            return c.json({
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id,
            });
        }

        return c.json({ success: false, message: "Payment not completed" }, 400);
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        return c.json({ message: "Error processing successful checkout", error: error.message }, 500);
    }
};

// Create a one-time Stripe coupon with the given discount percentage
async function createStripeCoupon(stripe, discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });

    return coupon.id;
}

// Create a new 10% reward coupon for the user, replacing any existing one
async function createNewCoupon(Coupon, userId) {
    await Coupon.findOneAndDelete({ userId });

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    });

    await newCoupon.save();

    return newCoupon;
}
