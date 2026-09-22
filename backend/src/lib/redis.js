import { Redis } from "@upstash/redis";

// Upstash's REST client talks over HTTP(S), unlike ioredis which needs a raw
// TCP socket the Workers runtime doesn't support for the wire protocol.
let client = null;

export const getRedis = (env) => {
    if (!client) {
        client = new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
            // Keep get/set behaving like the previous ioredis client (raw strings
            // in and out) since callers already do their own JSON.stringify/parse.
            automaticDeserialization: false,
        });
    }
    return client;
};
