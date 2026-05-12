import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Lazy import keeps authStore/axios dependency graph safe.
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      import("../../features/auth/store/authStore").then(({ useAuthStore }) => {
        const { user, clearAuth } = useAuthStore.getState();
        if (user) {
          clearAuth();
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
