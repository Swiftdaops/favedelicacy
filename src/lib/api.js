import axios from "axios";
import { toast } from "sonner";

// Use relative base in the browser so Next.js dev rewrites/proxy can forward
// requests to the deployed backend and avoid CORS mismatches. On the server
// fall back to NEXT_PUBLIC_API_URL or localhost.
const _base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const base = _base.replace(/\/$/, "");
const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
});

// Global response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Something went wrong!";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
