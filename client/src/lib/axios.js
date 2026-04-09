// ============================================================
// 📁 src/lib/axios.js  (updated — adds JWT interceptors)
//
// An axios "instance" is a pre-configured version of axios.
// We configure it once here and reuse it everywhere.
//
// NEW: Two interceptors added:
//
// 1. REQUEST interceptor  → runs before every request is sent
//    → reads the JWT token from localStorage (saved by Zustand persist)
//    → attaches it as an Authorization header
//    → server's authenticate middleware reads this header
//
// 2. RESPONSE interceptor → runs after every response comes back
//    → if the server returns 401 (token expired / invalid)
//    → automatically logs the user out and shows a message
//
// WITHOUT interceptors you'd have to manually add the token
// and handle 401s in every single store function. Very repetitive.
// Interceptors do it once, globally.
// ============================================================

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs before EVERY request this axios instance makes.
//
// We read the token from localStorage directly here instead of
// importing the Zustand store to avoid circular import issues
// (axios.js imports authStore, authStore imports axios.js = infinite loop).
//
// Zustand's persist middleware stores state under "auth-storage"
// as JSON: { state: { token: "...", user: {...} } }
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          // Attach token as Bearer — server reads Authorization header
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        // JSON parse failed — request goes without token
      }
    }
    return config; // must return config to proceed
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Intercepts 401 Unauthorized — token expired or invalid.
// Auto-logs out so the user doesn't see confusing error states.
//
// We import lazily (inside the function) to avoid
// the circular import problem.
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      import("../store/authStore").then(({ useAuthStore }) => {
        const { token, logout } = useAuthStore.getState();
        if (token) {
          logout();
          setTimeout(() => {
            import("react-hot-toast").then(({ default: toast }) => {
              toast.error("Session expired. Please log in again.");
            });
          }, 100);
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api;
