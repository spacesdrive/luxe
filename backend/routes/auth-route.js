import express from "express";
import { login, logout, signup, refreshToken, getProfile } from "../controllers/auth-controller.js";
import { protectRoute } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/signup", signup);                          // Register a new user
router.post("/login", login);                            // Log in an existing user
router.post("/logout", logout);                          // Log out and clear cookies
router.post("/refresh-token", refreshToken);             // Issue a new access token
router.get("/profile", protectRoute, getProfile);        // Get the current user's profile

export default router;