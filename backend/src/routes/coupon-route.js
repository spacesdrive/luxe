import { Hono } from "hono";
import { protectRoute } from "../middleware/auth-middleware.js";
import { withDb } from "../middleware/db-middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon-controller.js";

const router = new Hono();

router.use("*", withDb);

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);

export default router;
