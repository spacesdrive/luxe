import axios from "axios";
import { API_BASE } from "./config.js";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies (access/refresh tokens)
});

// The access token expires after 15 minutes. Without this, any request made
// after that just fails with 401 and the refresh token cookie sits unused
// until the user manually logs in again. On a 401, try refreshing once and
// replay the original request; if the refresh itself fails (refresh token
// also expired/missing), give up and let the original 401 propagate.
let refreshInFlight = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.startsWith("/auth/");

    if (response?.status !== 401 || isAuthEndpoint || config._retried) {
      throw error;
    }
    config._retried = true;

    try {
      refreshInFlight ??= api.post("/auth/refresh-token").finally(() => {
        refreshInFlight = null;
      });
      await refreshInFlight;
    } catch {
      throw error;
    }

    return api(config);
  }
);

export default api;
