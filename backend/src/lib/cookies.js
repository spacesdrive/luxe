import { setCookie, deleteCookie } from "hono/cookie";
import { ACCESS_MAX_AGE, REFRESH_MAX_AGE } from "./jwt.js";

// Detect if frontend & backend are on different origins (cross-site deployment)
const isCrossSite = (env) => {
    try {
        const feHost = new URL(env.FRONTEND_URL || "http://localhost:5173").hostname;
        const beHost = new URL(env.BACKEND_URL || "http://localhost:5000").hostname;
        return feHost !== beHost;
    } catch {
        return false;
    }
};

export const setAuthCookies = (c, accessToken, refreshToken) => {
    const crossSite = isCrossSite(c.env);
    const base = {
        httpOnly: true,
        secure: crossSite || c.env.NODE_ENV === "production",
        sameSite: crossSite ? "None" : "Strict",
        path: "/",
    };

    setCookie(c, "accessToken", accessToken, { ...base, maxAge: ACCESS_MAX_AGE });
    setCookie(c, "refreshToken", refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
};

export const setAccessCookie = (c, accessToken) => {
    const crossSite = isCrossSite(c.env);
    setCookie(c, "accessToken", accessToken, {
        httpOnly: true,
        secure: crossSite || c.env.NODE_ENV === "production",
        sameSite: crossSite ? "None" : "Strict",
        path: "/",
        maxAge: ACCESS_MAX_AGE,
    });
};

export const clearAuthCookies = (c) => {
    deleteCookie(c, "accessToken", { path: "/" });
    deleteCookie(c, "refreshToken", { path: "/" });
};
