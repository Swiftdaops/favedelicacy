import axios from "axios";
import { toast } from "sonner";

const _base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
