import { sign, verify } from "hono/jwt";

const ALG = "HS256";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

const nowSeconds = () => Math.floor(Date.now() / 1000);

export const generateTokens = async (userId, env) => {
    const accessToken = await sign(
        { userId, exp: nowSeconds() + ACCESS_TTL_SECONDS },
        env.ACCESS_TOKEN_SECRET,
        ALG
    );
    const refreshToken = await sign(
        { userId, exp: nowSeconds() + REFRESH_TTL_SECONDS },
        env.REFRESH_TOKEN_SECRET,
        ALG
    );
    return { accessToken, refreshToken };
};

export const signAccessToken = async (userId, env) =>
    sign({ userId, exp: nowSeconds() + ACCESS_TTL_SECONDS }, env.ACCESS_TOKEN_SECRET, ALG);

export const verifyAccessToken = (token, env) => verify(token, env.ACCESS_TOKEN_SECRET, ALG);
export const verifyRefreshToken = (token, env) => verify(token, env.REFRESH_TOKEN_SECRET, ALG);

export const ACCESS_MAX_AGE = ACCESS_TTL_SECONDS;
export const REFRESH_MAX_AGE = REFRESH_TTL_SECONDS;
