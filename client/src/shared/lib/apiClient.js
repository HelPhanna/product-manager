import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Read auth token from persisted state to avoid circular imports with the auth store.
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lazy import keeps authStore/axios dependency graph safe.
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      import("../../features/auth/store/authStore").then(({ useAuthStore }) => {
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

