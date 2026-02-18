// frontend/src/api/api.js

const API_PREFIX = "/api";

const BASE_URL =
  typeof window !== "undefined"
    ? import.meta?.env?.VITE_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000"
    : "http://localhost:5000";

/**
 * Core request handler
 */
async function request(method, path, body, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout || 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const url = `${BASE_URL}${API_PREFIX}${path}`;

  // Initialize headers
  const headers = {
    ...(options.headers || {}),
  };

  const fetchOptions = {
    method,
    credentials: "include", // Required for session cookies
    signal: options.signal || controller.signal,
    headers,
  };

  /**
   * SMART CONTENT-TYPE HANDLING
   * If body is FormData, we MUST NOT set Content-Type.
   * The browser will automatically set it to 'multipart/form-data' 
   * and include the correct boundary.
   */
  if (body instanceof FormData) {
    fetchOptions.body = body;
    // Explicitly ensure Content-Type is NOT set for FormData
    delete headers["Content-Type"]; 
  } else if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // Handle session expiration (Unauthorized)
    if (res.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname || "";
      // Retire `/login`: always redirect to admin login for auth failures
      const loginRoute = "/admin/login";
      if (!path.includes("/admin/login") && path !== loginRoute) {
        window.location.href = loginRoute;
        return null;
      }
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const error = new Error(data?.message || res.statusText || "Request failed");
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout: The server is taking too long to respond.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

const api = {
  get: (path, options) => request("GET", path, null, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  delete: (path, body, options = {}) => request("DELETE", path, body, options),
};

export default api;