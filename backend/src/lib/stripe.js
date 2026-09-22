import Stripe from "stripe";

let client = null;

// Explicitly use the fetch-based HTTP client — Stripe's default Node HTTP
// client relies on `node:http`, which is a non-functional stub on Workers.
export const getStripe = (env) => {
    if (!client) {
        client = new Stripe(env.STRIPE_SECRET_KEY, {
            httpClient: Stripe.createFetchHttpClient(),
        });
    }
    return client;
};
