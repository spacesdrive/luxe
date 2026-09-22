import { Hono } from "hono";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart-controller.js";
import { protectRoute } from "../middleware/auth-middleware.js";
import { withDb } from "../middleware/db-middleware.js";

const router = new Hono();

router.use("*", withDb);

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;
