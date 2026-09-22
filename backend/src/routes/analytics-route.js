import { Hono } from "hono";
import { adminRoute, protectRoute } from "../middleware/auth-middleware.js";
import { withDb } from "../middleware/db-middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics-controller.js";

const router = new Hono();

router.use("*", withDb);

// Admin-only: returns overall stats and last 7 days of daily sales data
router.get("/", protectRoute, adminRoute, async (c) => {
    try {
        const models = c.get("models");
        const analyticsData = await getAnalyticsData(models);

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(models, startDate, endDate);

        return c.json({
            analyticsData,
            dailySalesData,
        });
    } catch (error) {
        console.log("Error in analytics route", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
});

export default router;
