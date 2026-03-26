import express from "express";
import { protectRoute } from "../middleware/auth-middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon-controller.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);                // Get the active coupon for the current user
router.post("/validate", protectRoute, validateCoupon); // Validate a coupon code

export default router;