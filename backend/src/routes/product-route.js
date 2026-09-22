import { Hono } from "hono";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getFeaturedProducts,
    getProductById,
    getProductsByCategory,
    getPublicProducts,
    getRecommendedProducts,
    toggleFeaturedProduct,
    updateProduct,
} from "../controllers/product-controller.js";
import { adminRoute, protectRoute } from "../middleware/auth-middleware.js";
import { withDb } from "../middleware/db-middleware.js";

const router = new Hono();

router.use("*", withDb);

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/all", getPublicProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.get("/:id", getProductById);

export default router;
