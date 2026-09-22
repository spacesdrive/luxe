import { streamSSE } from "hono/streaming";
import { openConnection, closeConnection } from "../lib/db.js";
import { getModels } from "../models/registry.js";
import { getRedis } from "../lib/redis.js";
import { generateQueryEmbedding } from "../services/embedding-service.js";
import { queryProductVectors } from "../services/pinecone-service.js";
import { streamMessage, extractStructuredData } from "../services/llm-service.js";
import {
    analyzeIntent,
    getGreetingResponse,
    STORE_INFO_RESPONSE,
    OFF_TOPIC_RESPONSE,
} from "../services/intent-service.js";

const CHAT_SESSION_TTL = 60 * 60;
const MAX_HISTORY_TURNS = 12;

const memoryStore = new Map();

const getSessionHistory = async (env, sessionId) => {
    try {
        const data = await getRedis(env).get(`chat_session:${sessionId}`);
        return data ? JSON.parse(data) : [];
    } catch {
        return memoryStore.get(sessionId) || [];
    }
};

const saveSessionHistory = async (env, sessionId, history) => {
    const trimmed = history.slice(-MAX_HISTORY_TURNS);
    try {
        await getRedis(env).set(`chat_session:${sessionId}`, JSON.stringify(trimmed), { ex: CHAT_SESSION_TTL });
    } catch {
        memoryStore.set(sessionId, trimmed);
        if (memoryStore.size > 500) {
            const firstKey = memoryStore.keys().next().value;
            memoryStore.delete(firstKey);
        }
    }
};

const sendSSE = async (stream, event, data) => {
    const payload = typeof data === "string"
        ? { type: event, content: data }
        : { type: event, ...data };
    await stream.writeSSE({ data: JSON.stringify(payload) });
};

export const chat = async (c) => {
    const { message, sessionId } = await c.req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
        return c.json({ message: "Message is required", products: [] }, 400);
    }

    if (!sessionId || typeof sessionId !== "string") {
        return c.json({ message: "sessionId is required", products: [] }, 400);
    }

    const trimmedMessage = message.trim();
    const env = c.env;

    // This handler isn't behind the shared `withDb` middleware: streamSSE()
    // fires its callback without awaiting it and returns immediately, so the
    // actual product lookups below run after this function has returned.
    // The connection has to stay open for that whole callback and be closed
    // from inside it — a middleware `finally` here would close it too early.
    let connection;
    try {
        connection = await openConnection(env.MONGO_DB_URI);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        return c.json({ message: "Database unavailable", products: [] }, 503);
    }
    const { Product } = getModels(connection);

    return streamSSE(c, async (stream) => {
        try {
            const { intent, correctedQuery, budget, category } = await analyzeIntent(trimmedMessage);

            console.log(`Intent: ${intent} | Corrected: "${correctedQuery}" | Budget: ${budget} | Category: ${category}`);

            if (intent === "greeting") {
                const response = getGreetingResponse();
                await sendSSE(stream, "token", response.message);
                await sendSSE(stream, "done", { products: [], cartProducts: [], compareProducts: [] });
                return;
            }

            if (intent === "off_topic") {
                await sendSSE(stream, "token", OFF_TOPIC_RESPONSE.message);
                await sendSSE(stream, "done", { products: [], cartProducts: [], compareProducts: [] });
                return;
            }

            if (intent === "store_info") {
                await sendSSE(stream, "token", STORE_INFO_RESPONSE.message);
                await sendSSE(stream, "done", { products: [], cartProducts: [], compareProducts: [] });
                return;
            }

            let products = [];
            try {
                const queryEmbedding = await generateQueryEmbedding(env, correctedQuery || trimmedMessage);
                const vectorMatches = await queryProductVectors(env, queryEmbedding, 8);
                if (vectorMatches && vectorMatches.length > 0) {
                    products = await Product.find({
                        _id: { $in: vectorMatches.map((m) => m.metadata.productId) },
                    }).lean();
                }
            } catch {
                // Vector search unavailable — fall back to keyword search
            }

            if (products.length === 0) {
                const query = correctedQuery || trimmedMessage;
                const searchWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
                const categoryMatch = ["electronics", "clothing", "accessories", "jewelry", "home", "fragrance"]
                    .find((cat) => query.toLowerCase().includes(cat));

                const filter = categoryMatch
                    ? { category: { $regex: categoryMatch, $options: "i" } }
                    : searchWords.length > 0
                    ? { $or: searchWords.map((w) => ({ $or: [{ name: { $regex: w, $options: "i" } }, { description: { $regex: w, $options: "i" } }, { category: { $regex: w, $options: "i" } }] })) }
                    : {};

                products = await Product.find(filter).limit(8).lean();
            }

            if (!products || products.length === 0) {
                const msg = "I couldn't find any products matching your query. Try browsing our categories — we have electronics, clothing, jewelry, accessories, fragrances, and home items!";
                await sendSSE(stream, "token", msg);
                await sendSSE(stream, "done", { products: [], cartProducts: [], compareProducts: [] });
                return;
            }

            if (budget) {
                const filtered = products.filter((p) => p.price <= budget);
                if (filtered.length > 0) products = filtered;
            }

            if (category) {
                const filtered = products.filter(
                    (p) => p.category?.toLowerCase() === category.toLowerCase()
                );
                if (filtered.length > 0) products = filtered;
            }

            if (!products || products.length === 0) {
                const msg = "I found some potential matches but couldn't retrieve their details. Please try again.";
                await sendSSE(stream, "token", msg);
                await sendSSE(stream, "done", { products: [], cartProducts: [], compareProducts: [] });
                return;
            }

            const sessionHistory = await getSessionHistory(env, sessionId);

            const streamedMessage = await streamMessage(
                trimmedMessage,
                correctedQuery,
                products,
                budget,
                category,
                sessionHistory,
                async (delta) => {
                    await sendSSE(stream, "token", delta);
                }
            );

            const structured = await extractStructuredData(
                trimmedMessage,
                streamedMessage,
                products,
                sessionHistory
            );

            const recommendedProducts = structured.productIds
                .map((id) => products.find((p) => p._id.toString() === id))
                .filter(Boolean);

            const cartProducts = structured.cartProductIds
                .map((id) => products.find((p) => p._id.toString() === id))
                .filter(Boolean);

            const compareProducts = structured.compareProductIds.length === 2
                ? structured.compareProductIds
                    .map((id) => products.find((p) => p._id.toString() === id))
                    .filter(Boolean)
                : [];

            await sendSSE(stream, "done", {
                products: recommendedProducts,
                cartProducts,
                compareProducts,
            });

            await saveSessionHistory(env, sessionId, [
                ...sessionHistory,
                { role: "user", content: trimmedMessage },
                { role: "assistant", content: streamedMessage },
            ]);
        } catch (error) {
            console.error("Error in chat controller:", error.message, error.stack);
            const debugMsg = env.NODE_ENV === "production" ? error.message : error.stack;
            await sendSSE(stream, "error", { message: "Sorry, I'm having trouble right now. Please try again in a moment.", error: debugMsg });
        } finally {
            await closeConnection(connection);
        }
    });
};
