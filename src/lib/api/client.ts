import axios from "axios";
import { ROUTES } from "@/constants";
import type { ApiFailure } from "@/types/api";

/** Client-only axios instance. ENDPOINTS already start with "/api", so no baseURL. */
export const api = axios.create({ withCredentials: true });

api.interceptors.response.use(
  // Unwrap the envelope so callers get T.
  (res) => res.data.data,
  (err) => {
    const e: ApiFailure["error"] = err.response?.data?.error ?? {
      code: "NETWORK_ERROR",
      message: "Something went wrong. Try again.",
    };
    // Hard redirect: no logout call (so no 401 loop), and it wipes all in-memory client state.
    if (err.response?.status === 401 && location.pathname !== ROUTES.LOGIN) location.assign(ROUTES.LOGIN);
    return Promise.reject(e);
  },
);
