import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../../shared/lib/apiClient";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === "admin",
      isViewer: () => get().user?.role === "viewer",

      register: async ({ username, email, password }) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/api/auth/register", {
            username,
            email,
            password,
          });
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome, ${data.user.username}! 🎉`);
          return { success: true };
        } catch (err) {
          set({ loading: false });
          const message =
            err.response?.data?.errors?.[0]?.message ||
            err.response?.data?.message ||
            "Registration failed";
          toast.error(message);
          return { success: false, message };
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/api/auth/login", { email, password });
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome back, ${data.user.username}!`);
          return { success: true };
        } catch (err) {
          set({ loading: false });
          const message =
            err.response?.data?.message || "Invalid email or password";
          toast.error(message);
          return { success: false, message };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        toast.success("Logged out successfully");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

