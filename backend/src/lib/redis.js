import { Redis } from "@upstash/redis";

// Upstash's REST client talks over HTTP(S) — it's a stateless wrapper around
// fetch(), not a pooled connection, so there's no cost to building a fresh
// one per call. That also avoids a real bug: a Worker isolate can stay warm
// across many requests, and a client cached at module scope from the first
// call would keep using whatever env it saw then even after secrets rotate.
export const getRedis = (env) =>
    new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
        // Keep get/set behaving like the previous ioredis client (raw strings
        // in and out) since callers already do their own JSON.stringify/parse.
        automaticDeserialization: false,
    });
