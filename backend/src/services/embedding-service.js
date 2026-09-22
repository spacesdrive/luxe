const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/embeddings";
const EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5";
const EMBEDDING_DIMENSION = 1024;

const buildProductText = (product) => {
    const parts = [
        product.name || "",
        product.category || "",
        product.description || "",
    ];

    if (product.sizes && product.sizes.length > 0) {
        parts.push(`Available sizes: ${product.sizes.join(", ")}`);
    }

    if (product.shoeSizes && product.shoeSizes.length > 0) {
        parts.push(`Available shoe sizes: ${product.shoeSizes.join(", ")}`);
    }

    if (product.price) {
        parts.push(`Price: $${product.price}`);
    }

    if (product.isFeatured) {
        parts.push("Featured product. Premium quality.");
    }

    return parts.filter(Boolean).join(" ").trim();
};

// Uses fetch directly rather than axios — axios's Node adapter relies on
// `node:http`, which is a non-functional stub on Workers.
const callNvidiaEmbedding = async (env, text, inputType) => {
    if (!text || text.trim().length === 0) {
        throw new Error("Cannot generate embedding for empty text");
    }

    if (!env.NVIDIA_API_KEY) {
        throw new Error("NVIDIA_API_KEY is not set in environment variables");
    }

    const response = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            input: [text],
            model: EMBEDDING_MODEL,
            input_type: inputType,
            encoding_format: "float",
            truncate: "END",
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`NVIDIA API request failed (${response.status}): ${JSON.stringify(data)}`);
    }

    const embedding = data?.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error(`NVIDIA API returned invalid embedding. Response: ${JSON.stringify(data)}`);
    }

    return embedding;
};

export const generateProductEmbedding = async (env, product) => {
    const text = buildProductText(product);
    console.log(`Generating embedding for: "${text.substring(0, 80)}..."`);
    return await callNvidiaEmbedding(env, text, "passage");
};

export const generateQueryEmbedding = async (env, query) => {
    return await callNvidiaEmbedding(env, query, "query");
};

export { EMBEDDING_DIMENSION, buildProductText };
