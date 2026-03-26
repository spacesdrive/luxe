import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";

let pineconeClient = null;
let pineconeIndex = null;
let indexHost = null;

const getPineconeClient = () => {
    if (!pineconeClient) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }
    return pineconeClient;
};

const getIndexHost = async () => {
    if (indexHost) return indexHost;

    const pc = getPineconeClient();
    const description = await pc.describeIndex(process.env.PINECONE_INDEX);
    indexHost = description.host;
    console.log(`Pinecone index host: ${indexHost}`);
    return indexHost;
};

const getPineconeIndex = async () => {
    if (pineconeIndex) return pineconeIndex;
    const pc = getPineconeClient();
    pineconeIndex = pc.index(process.env.PINECONE_INDEX);
    return pineconeIndex;
};

export const upsertProductVector = async (productId, embedding, metadata) => {
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error(`Invalid embedding for product ${productId}`);
    }

    const host = await getIndexHost();

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

    const response = await axios.post(
        `https://${host}/vectors/upsert`,
        { vectors: [record] },
        {
            headers: {
                "Api-Key": process.env.PINECONE_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    );

    console.log(`Successfully upserted product ${productId} to Pinecone. Upserted count: ${response.data.upsertedCount}`);
};

export const queryProductVectors = async (queryEmbedding, topK = 5) => {
    const index = await getPineconeIndex();
    const result = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
    });
    return result.matches || [];
};

export const deleteProductVector = async (productId) => {
    const host = await getIndexHost();

    await axios.post(
        `https://${host}/vectors/delete`,
        { ids: [productId.toString()] },
        {
            headers: {
                "Api-Key": process.env.PINECONE_API_KEY,
                "Content-Type": "application/json",
            },
        }
    );

    console.log(`Successfully deleted product ${productId} from Pinecone`);
};