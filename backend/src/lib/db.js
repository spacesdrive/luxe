import mongoose from "mongoose";

// Cloudflare Workers ties a TCP socket to the request that opened it — reusing
// one Mongoose connection (and its underlying socket) across requests causes
// roughly every other request to hang until the runtime kills it. So instead
// of caching a connection at module scope, each request opens its own
// connection and closes it when the request finishes (see the middleware in
// src/index.js). This costs a fresh handshake per request, but is the only
// approach that is actually correct under Workers' per-request I/O isolation.
export const openConnection = async (uri) => {
    const connection = mongoose.createConnection(uri, { bufferCommands: false });
    await connection.asPromise();
    return connection;
};

export const closeConnection = async (connection) => {
    try {
        await connection.close();
    } catch {
        // Request is already finishing — nothing useful to do with a close error.
    }
};
