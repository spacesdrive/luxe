// Minimal fetch-based Cloudinary client (upload + destroy). The official
// `cloudinary` SDK shells out to Node's `crypto`/`https`/`fs` modules, which
// aren't reliable on Workers, so we sign and call Cloudinary's HTTP API directly.

const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

const sha1 = async (message) => {
    const data = new TextEncoder().encode(message);
    const digest = await crypto.subtle.digest("SHA-1", data);
    return toHex(digest);
};

// Cloudinary signs requests by sorting all non-file params alphabetically,
// joining as `key=value&...`, appending the API secret, then SHA-1 hashing.
const signParams = async (params, apiSecret) => {
    const toSign = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");
    return sha1(`${toSign}${apiSecret}`);
};

export const uploadImage = async (env, image, { folder } = {}) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature = await signParams(paramsToSign, env.CLOUDINARY_API_SECRET);

    const body = new FormData();
    body.append("file", image);
    body.append("api_key", env.CLOUDINARY_API_KEY);
    body.append("timestamp", String(timestamp));
    body.append("folder", folder);
    body.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || "Cloudinary upload failed");
    }
    return data;
};

export const destroyImage = async (env, publicId) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { public_id: publicId, timestamp };
    const signature = await signParams(paramsToSign, env.CLOUDINARY_API_SECRET);

    const body = new FormData();
    body.append("public_id", publicId);
    body.append("api_key", env.CLOUDINARY_API_KEY);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: "POST",
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || "Cloudinary destroy failed");
    }
    return data;
};
