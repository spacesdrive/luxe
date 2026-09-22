import { Hono } from "hono";
import { cors } from "hono/cors";

import chatRoutes from "./routes/chat-route.js";
import authenticationRouter from "./routes/auth-route.js";
import productRoutes from "./routes/product-route.js";
import cartRoutes from "./routes/cart-route.js";
import couponRoutes from "./routes/coupon-route.js";
import paymentRoutes from "./routes/payment-route.js";
import analyticsRoutes from "./routes/analytics-route.js";

const app = new Hono();

// CORS — automatically allows the frontend origin (works for any hosting service)
app.use("*", async (c, next) => {
    const corsMiddleware = cors({
        origin: c.env.FRONTEND_URL,
        credentials: true,
    });
    return corsMiddleware(c, next);
});

// Each route module that needs the database applies `withDb` itself (see
// src/middleware/db-middleware.js). Chat is the one exception: its SSE
// response keeps running after this middleware chain would resolve, so it
// manages its own request-scoped connection lifecycle in chat-controller.js.
app.route("/api/auth", authenticationRouter);
app.route("/api/products", productRoutes);
app.route("/api/cart", cartRoutes);
app.route("/api/coupons", couponRoutes);
app.route("/api/payments", paymentRoutes);
app.route("/api/analytics", analyticsRoutes);
app.route("/api/chat", chatRoutes);

// Health check
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

export default app;
