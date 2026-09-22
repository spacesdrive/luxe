import { openConnection, closeConnection } from "../lib/db.js";
import { getModels } from "../models/registry.js";

// Opens a request-scoped MongoDB connection and exposes its bound models via
// c.get("models"). Not suitable for routes that keep doing DB work after
// `next()` resolves (e.g. a streamed SSE response, whose callback Hono fires
// without awaiting) — those must manage their own connection lifecycle
// instead (see chat-controller.js).
export const withDb = async (c, next) => {
    let connection;
    try {
        connection = await openConnection(c.env.MONGO_DB_URI);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        return c.json({ message: "Database unavailable" }, 503);
    }

    c.set("models", getModels(connection));

    try {
        await next();
    } finally {
        await closeConnection(connection);
    }
};
