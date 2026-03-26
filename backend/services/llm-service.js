import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STREAM_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
];

const JSON_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
];

const buildProductContext = (products) =>
    products
        .map((p) => {
            const lines = [
                `ID: ${p._id}`,
                `Name: ${p.name}`,
                `Category: ${p.category}`,
                `Price: $${p.price}`,
                `Description: ${p.description}`,
            ];
            if (p.sizes?.length > 0) lines.push(`Clothing Sizes: ${p.sizes.join(", ")}`);
            if (p.shoeSizes?.length > 0) lines.push(`Shoe Sizes: ${p.shoeSizes.join(", ")}`);
            if (p.isFeatured) lines.push(`Featured: Yes`);
            return lines.join("\n");
        })
        .join("\n\n---\n\n");

const buildContextHeader = (userMessage, correctedQuery, budget, category) => {
    const lines = [`Customer message: "${userMessage}"`];
    if (correctedQuery && correctedQuery !== userMessage) lines.push(`(Interpreted as: "${correctedQuery}")`);
    if (budget) lines.push(`Customer budget: $${budget}`);
    if (category) lines.push(`Category focus: ${category}`);
    return lines.join("\n");
};

const STREAM_SYSTEM_PROMPT = `You are a warm, knowledgeable shopping assistant for LUXE, a premium ecommerce store selling electronics, clothing, accessories, jewelry, home products, and fragrances.

RULES:
- Only recommend products from the catalog provided. Never invent products.
- Never answer questions unrelated to the store or products.
- Use conversation history for follow-ups like "something cheaper" or "show me more".
- Mention product names and prices naturally in your response.
- If the user wants to compare products, describe the key differences clearly.
- If the user wants to add something to cart, confirm which product you're adding.
- Be concise, warm, and helpful. 2-4 sentences max.
- Write plain conversational text only. No JSON. No bullet points. No markdown.`;

const EXTRACT_SYSTEM_PROMPT = `You are a structured data extractor. Given a conversation, extract actions and product selections.

Return ONLY valid JSON with exactly these fields:
{
  "productIds": ["id1", "id2"],
  "cartProductIds": [],
  "compareProductIds": []
}

Rules:
- "productIds": up to 4 product IDs the assistant recommended or discussed (max 4)
- "cartProductIds": product IDs the user wants to add to cart. Can be multiple if user said "add both" or "add all". Empty array if no cart intent.
- "compareProductIds": exactly 2 product IDs if user asked to compare. Empty array otherwise.
- Use ONLY IDs from the provided product list. Never invent IDs.
- Return empty arrays [] for fields with no data. Never return null.`;

export const streamMessage = async (
    userMessage,
    correctedQuery,
    products,
    budget,
    category,
    history,
    onChunk
) => {
    const userPrompt = `${buildContextHeader(userMessage, correctedQuery, budget, category)}

Available products:
${buildProductContext(products)}`;

    const messages = [
        ...history,
        { role: "user", content: userPrompt },
    ];

    let lastError;
    for (const modelName of STREAM_MODELS) {
        try {
            const stream = await groq.chat.completions.create({
                model: modelName,
                messages: [
                    { role: "system", content: STREAM_SYSTEM_PROMPT },
                    ...messages,
                ],
                temperature: 0.45,
                max_tokens: 512,
                stream: true,
            });

            let fullText = "";
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) {
                    fullText += delta;
                    onChunk(delta);
                }
            }
            return fullText;
        } catch (error) {
            console.error(`Stream model ${modelName} failed: ${error.message}`);
            lastError = error;
        }
    }
    throw new Error(`All stream models failed: ${lastError?.message}`);
};

export const extractStructuredData = async (
    userMessage,
    assistantMessage,
    products,
    history
) => {
    const productList = products.map((p) => `ID: ${p._id} | Name: ${p.name} | Price: $${p.price}`).join("\n");

    const userPrompt = `Conversation:
User: "${userMessage}"
Assistant: "${assistantMessage}"

Available product IDs:
${productList}

Extract the structured data from this conversation.`;

    let lastError;
    for (const modelName of JSON_MODELS) {
        try {
            const completion = await groq.chat.completions.create({
                model: modelName,
                messages: [
                    { role: "system", content: EXTRACT_SYSTEM_PROMPT },
                    ...history.slice(-6),
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.1,
                max_tokens: 256,
                response_format: { type: "json_object" },
            });

            const parsed = JSON.parse(completion.choices[0].message.content);
            return {
                productIds: Array.isArray(parsed.productIds) ? parsed.productIds.slice(0, 4) : [],
                cartProductIds: Array.isArray(parsed.cartProductIds) ? parsed.cartProductIds : [],
                compareProductIds: Array.isArray(parsed.compareProductIds) && parsed.compareProductIds.length === 2
                    ? parsed.compareProductIds
                    : [],
            };
        } catch (error) {
            console.error(`Extract model ${modelName} failed: ${error.message}`);
            lastError = error;
        }
    }

    console.error(`All extract models failed: ${lastError?.message}`);
    return { productIds: [], cartProductIds: [], compareProductIds: [] };
};