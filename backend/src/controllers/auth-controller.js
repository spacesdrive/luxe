import { getCookie } from "hono/cookie";
import { getRedis } from "../lib/redis.js";
import { generateTokens, signAccessToken, verifyRefreshToken } from "../lib/jwt.js";
import { setAuthCookies, setAccessCookie, clearAuthCookies } from "../lib/cookies.js";

// Store the refresh token in Redis with a 7-day expiry
const storeRefreshToken = async (env, userId, refreshToken) => {
    await getRedis(env).set(`refresh_token:${userId}`, refreshToken, { ex: 7 * 24 * 60 * 60 });
};

// Register a new user and issue tokens
export const signup = async (c) => {
    const { email, password, name } = await c.req.json();
    try {
        const { User } = c.get("models");
        const userExists = await User.findOne({ email });

        if (userExists) {
            return c.json({ message: "User already exists" }, 400);
        }

        const user = await User.create({ name, email, password });

        const { accessToken, refreshToken } = await generateTokens(user._id, c.env);
        await storeRefreshToken(c.env, user._id, refreshToken);

        setAuthCookies(c, accessToken, refreshToken);

        return c.json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            201
        );
    } catch (error) {
        console.log("Error in signup controller", error.message);
        return c.json({ message: error.message }, 500);
    }
};

// Log in an existing user and issue tokens
export const login = async (c) => {
    try {
        const { email, password } = await c.req.json();
        const { User } = c.get("models");
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = await generateTokens(user._id, c.env);
            await storeRefreshToken(c.env, user._id, refreshToken);
            setAuthCookies(c, accessToken, refreshToken);

            return c.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        return c.json({ message: "Invalid email or password" }, 400);
    } catch (error) {
        console.log("Error in login controller", error.message);
        return c.json({ message: error.message }, 500);
    }
};

// Log out the user by deleting their refresh token from Redis and clearing cookies
export const logout = async (c) => {
    try {
        const refreshToken = getCookie(c, "refreshToken");
        if (refreshToken) {
            const decoded = await verifyRefreshToken(refreshToken, c.env).catch(() => null);
            if (decoded) {
                await getRedis(c.env).del(`refresh_token:${decoded.userId}`);
            }
        }

        clearAuthCookies(c);
        return c.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

// Issue a new access token using a valid refresh token
export const refreshToken = async (c) => {
    try {
        const refreshToken = getCookie(c, "refreshToken");

        if (!refreshToken) {
            return c.json({ message: "No refresh token provided" }, 401);
        }

        const decoded = await verifyRefreshToken(refreshToken, c.env);
        const storedToken = await getRedis(c.env).get(`refresh_token:${decoded.userId}`);

        if (storedToken !== refreshToken) {
            return c.json({ message: "Invalid refresh token" }, 401);
        }

        const accessToken = await signAccessToken(decoded.userId, c.env);
        setAccessCookie(c, accessToken);

        return c.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};

// Return the currently authenticated user's profile
export const getProfile = async (c) => {
    try {
        return c.json(c.get("user"));
    } catch (error) {
        return c.json({ message: "Server error", error: error.message }, 500);
    }
};
