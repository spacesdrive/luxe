import Product from "../models/product-model.js";
import { redis } from "../lib/redis.js";
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

const getSessionHistory = async (sessionId) => {
    try {
        const data = await redis.get(`chat_session:${sessionId}`);
        return data ? JSON.parse(data) : [];
    } catch {
        return memoryStore.get(sessionId) || [];
    }
};

const saveSessionHistory = async (sessionId, history) => {
    const trimmed = history.slice(-MAX_HISTORY_TURNS);
    try {
        await redis.set(`chat_session:${sessionId}`, JSON.stringify(trimmed), "EX", CHAT_SESSION_TTL);
    } catch {
        memoryStore.set(sessionId, trimmed);
        if (memoryStore.size > 500) {
            const firstKey = memoryStore.keys().next().value;
            memoryStore.delete(firstKey);
        }
    }
};

const sendSSE = (res, event, data) => {
    const payload = typeof data === "string"
        ? { type: event, content: data }
        : { type: event, ...data };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({ message: "Message is required", products: [] });
        }

        if (!sessionId || typeof sessionId !== "string") {
            return res.status(400).json({ message: "sessionId is required", products: [] });
        }

        const trimmedMessage = message.trim();
        const { intent, correctedQuery, budget, category } = await analyzeIntent(trimmedMessage);

        console.log(`Intent: ${intent} | Corrected: "${correctedQuery}" | Budget: ${budget} | Category: ${category}`);

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        if (intent === "greeting") {
            const response = getGreetingResponse();
            sendSSE(res, "token", response.message);
            sendSSE(res, "done", { products: [], cartProducts: [], compareProducts: [] });
            return res.end();
        }

        if (intent === "off_topic") {
            sendSSE(res, "token", OFF_TOPIC_RESPONSE.message);
            sendSSE(res, "done", { products: [], cartProducts: [], compareProducts: [] });
            return res.end();
        }

        if (intent === "store_info") {
            sendSSE(res, "token", STORE_INFO_RESPONSE.message);
            sendSSE(res, "done", { products: [], cartProducts: [], compareProducts: [] });
            return res.end();
        }

        let products = [];
        try {
            const queryEmbedding = await generateQueryEmbedding(correctedQuery || trimmedMessage);
            const vectorMatches = await queryProductVectors(queryEmbedding, 8);
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
                .find((c) => query.toLowerCase().includes(c));

            const filter = categoryMatch
                ? { category: { $regex: categoryMatch, $options: "i" } }
                : searchWords.length > 0
                ? { $or: searchWords.map((w) => ({ $or: [{ name: { $regex: w, $options: "i" } }, { description: { $regex: w, $options: "i" } }, { category: { $regex: w, $options: "i" } }] })) }
                : {};

            products = await Product.find(filter).limit(8).lean();
        }

        if (!products || products.length === 0) {
            const msg = "I couldn't find any products matching your query. Try browsing our categories — we have electronics, clothing, jewelry, accessories, fragrances, and home items!";
            sendSSE(res, "token", msg);
            sendSSE(res, "done", { products: [], cartProducts: [], compareProducts: [] });
            return res.end();
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
            sendSSE(res, "token", msg);
            sendSSE(res, "done", { products: [], cartProducts: [], compareProducts: [] });
            return res.end();
        }

        const sessionHistory = await getSessionHistory(sessionId);

        let streamedMessage = "";

        streamedMessage = await streamMessage(
            trimmedMessage,
            correctedQuery,
            products,
            budget,
            category,
            sessionHistory,
            (delta) => {
                sendSSE(res, "token", delta);
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

        sendSSE(res, "done", {
            products: recommendedProducts,
            cartProducts,
            compareProducts,
        });

        res.end();

        await saveSessionHistory(sessionId, [
            ...sessionHistory,
            { role: "user", content: trimmedMessage },
            { role: "assistant", content: streamedMessage },
        ]);
    } catch (error) {
        console.error("Error in chat controller:", error.message, error.stack);
        const debugMsg = process.env.NODE_ENV === "production"
            ? error.message
            : error.stack;
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Sorry, I'm having trouble right now. Please try again in a moment.",
                error: debugMsg,
                products: [],
            });
        }
        sendSSE(res, "error", { message: "Sorry, I'm having trouble right now. Please try again in a moment.", error: debugMsg });
        res.end();
    }
};