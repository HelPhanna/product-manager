import { create } from "zustand";
import api from "../../../shared/lib/apiClient";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  authChecked: false,

  isAuthenticated: () => !!get().user,
  isAdmin: () => ["admin", "super_admin"].includes(get().user?.role),
  isViewer: () => get().user?.role === "viewer",

  clearAuth: () => set({ user: null, loading: false, authChecked: true }),

  checkAuth: async () => {
    if (get().authChecked) {
      return !!get().user;
    }

    set({ loading: true });

    try {
      const { data } = await api.get("/api/auth/me");
      set({ user: data.user, loading: false, authChecked: true });
      return true;
    } catch {
      set({ user: null, loading: false, authChecked: true });
      return false;
    }
  },

  register: async ({ username, email, password }) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/api/auth/register", {
        username,
        email,
        password,
      });
      set({ user: data.user, loading: false, authChecked: true });
      toast.success(`Welcome, ${data.user.username}!`);
      return { success: true };
    } catch (err) {
      set({ loading: false, authChecked: true });
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
      set({ user: data.user, loading: false, authChecked: true });
      toast.success(`Welcome back, ${data.user.username}!`);
      return { success: true };
    } catch (err) {
      set({ loading: false, authChecked: true });
      const message =
        err.response?.data?.message || "Invalid email or password";
      toast.error(message);
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
    } finally {
      set({ user: null, loading: false, authChecked: true });
      toast.success("Logged out successfully");
    }
  },
}));
