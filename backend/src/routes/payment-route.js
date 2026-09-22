import { Hono } from "hono";
import { protectRoute } from "../middleware/auth-middleware.js";
import { withDb } from "../middleware/db-middleware.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment-controller.js";

const router = new Hono();

router.use("*", withDb);

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
