import Stripe from "stripe";

// Built fresh per call rather than cached at module scope — a warm Worker
// isolate can outlive a secret rotation, and a cached client would keep
// using whatever key it saw on its first call (see lib/redis.js for the
// same issue caught in practice). Explicitly uses the fetch-based HTTP
// client since Stripe's default Node HTTP client relies on `node:http`,
// which is a non-functional stub on Workers.
export const getStripe = (env) =>
    new Stripe(env.STRIPE_SECRET_KEY, {
        httpClient: Stripe.createFetchHttpClient(),
    });
