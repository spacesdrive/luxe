import { Pinecone } from "@pinecone-database/pinecone";

// Built fresh per call rather than cached at module scope — a warm Worker
// isolate can outlive a secret rotation, and a cached client/host would keep
// using whatever env it saw on its first call (see lib/redis.js for the same
// issue caught in practice).
const getPineconeClient = (env) => new Pinecone({ apiKey: env.PINECONE_API_KEY });

const getIndexHost = async (env) => {
    const pc = getPineconeClient(env);
    const description = await pc.describeIndex(env.PINECONE_INDEX);
    return description.host;
};

const getPineconeIndex = (env) => getPineconeClient(env).index(env.PINECONE_INDEX);

export const upsertProductVector = async (env, productId, embedding, metadata) => {
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error(`Invalid embedding for product ${productId}`);
    }

    const host = await getIndexHost(env);

    const record = {
        id: productId.toString(),
        values: embedding.map(Number),
        metadata: {
            productId: productId.toString(),
            name: metadata.name || "",
            category: metadata.category || "",
            price: Number(metadata.price) || 0,
        },
    };

    const response = await fetch(`https://${host}/vectors/upsert`, {
        method: "POST",
        headers: {
            "Api-Key": env.PINECONE_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ vectors: [record] }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Pinecone upsert failed (${response.status}): ${JSON.stringify(data)}`);
    }

    console.log(`Successfully upserted product ${productId} to Pinecone. Upserted count: ${data.upsertedCount}`);
};

export const queryProductVectors = async (env, queryEmbedding, topK = 5) => {
    const index = await getPineconeIndex(env);
    const result = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
    });
    return result.matches || [];
};

export const deleteProductVector = async (env, productId) => {
    const host = await getIndexHost(env);

    const response = await fetch(`https://${host}/vectors/delete`, {
        method: "POST",
        headers: {
            "Api-Key": env.PINECONE_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [productId.toString()] }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(`Pinecone delete failed (${response.status}): ${JSON.stringify(data)}`);
    }

    console.log(`Successfully deleted product ${productId} from Pinecone`);
};
