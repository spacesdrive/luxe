import Redis from "ioredis";
import { ENV } from "./env.js";

export const redis = new Redis(ENV.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
    reconnectOnError: () => false,
});

redis.on("error", (err) => {
    console.warn(`Redis unavailable: ${err.message}`);
});