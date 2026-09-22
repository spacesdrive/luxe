import Groq from "groq-sdk";

let _groq = null;
const groq = new Proxy({}, {
    get: (_, prop) => {
        if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        return _groq[prop];
    },
});

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for LUXE, a premium ecommerce store selling electronics, clothing, accessories, jewelry, home products, and fragrances.

Classify the user message into exactly one of these intents:
- "product_search": user is looking for a product, asking about products, wants recommendations, mentions a product category, material, use case, or describes what they want
- "price_filter": user mentions a budget, price range, "under X", "below X", "cheap", "affordable", "expensive", "luxury"
- "greeting": user says hi, hello, hey, thanks, bye, or makes small talk
- "store_info": user asks about shipping, returns, store policies, payment methods
- "off_topic": anything not related to shopping or products (politics, coding, recipes, sports, etc.)

Also extract:
- "corrected_query": the user's message with ALL spelling mistakes and typos fixed, grammar corrected. If no typos, return the original.
- "budget": if a price/budget is mentioned, extract the number. Otherwise null.
- "category": if a product category is clearly mentioned, extract it (electronics/clothing/accessories/jewelry/home/fragrance). Otherwise null.

Respond ONLY with valid JSON:
{
  "intent": "product_search|price_filter|greeting|store_info|off_topic",
  "corrected_query": "...",
  "budget": null or number,
  "category": null or "string"
}`;

const GREETING_RESPONSES = [
    "Hello! Welcome to LUXE. I'm here to help you find the perfect product. What are you looking for today?",
    "Hi there! I'm your LUXE shopping assistant. Ask me about our electronics, clothing, jewelry, accessories, fragrances, or home products!",
    "Hey! Great to have you here. I can help you discover amazing products at LUXE. What can I find for you?",
];

const STORE_INFO_RESPONSE = {
    message: "For questions about shipping, returns, or store policies, please visit our Help Center or contact our support team. I'm best at helping you find the perfect products! What are you looking for today?",
    products: [],
};

const OFF_TOPIC_RESPONSE = {
    message: "I'm specialized in helping you find amazing products at LUXE! I can assist with product recommendations across our electronics, clothing, jewelry, accessories, fragrance, and home categories. What would you like to explore?",
    products: [],
};

export const analyzeIntent = async (message) => {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: INTENT_SYSTEM_PROMPT },
                { role: "user", content: message },
            ],
            temperature: 0.1,
            max_tokens: 200,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return {
            intent: result.intent || "product_search",
            correctedQuery: result.corrected_query || message,
            budget: result.budget || null,
            category: result.category || null,
        };
    } catch {
        return {
            intent: "product_search",
            correctedQuery: message,
            budget: null,
            category: null,
        };
    }
};

export const getGreetingResponse = () => {
    const msg = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
    return { message: msg, products: [] };
};

export { STORE_INFO_RESPONSE, OFF_TOPIC_RESPONSE };