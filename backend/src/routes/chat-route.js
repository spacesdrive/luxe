import { Hono } from "hono";
import { chat } from "../controllers/chat-controller.js";

const router = new Hono();

router.post("/", chat);

export default router;
