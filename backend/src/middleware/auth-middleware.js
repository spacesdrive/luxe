import { getCookie } from "hono/cookie";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import { verifyAccessToken } from "../lib/jwt.js";

// Middleware to verify the access token and attach the user to the context
export const protectRoute = async (c, next) => {
    try {
        const accessToken = getCookie(c, "accessToken");

        if (!accessToken) {
            return c.json({ message: "Unauthorized - No access token provided" }, 401);
        }

        try {
            const decoded = await verifyAccessToken(accessToken, c.env);
            const { User } = c.get("models");
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return c.json({ message: "User not found" }, 401);
            }

            c.set("user", user);
            await next();
        } catch (error) {
            if (error instanceof JwtTokenExpired) {
                return c.json({ message: "Unauthorized - Access token expired" }, 401);
            }
            throw error;
        }
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return c.json({ message: "Unauthorized - Invalid access token" }, 401);
    }
};

// Middleware to restrict access to admin users only
export const adminRoute = async (c, next) => {
    const user = c.get("user");
    if (user && user.role === "admin") {
        await next();
    } else {
        return c.json({ message: "Access denied - Admin only" }, 403);
    }
};
