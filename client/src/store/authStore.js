import { create } from "zustand";
import api from "../lib/axios";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // ── Register ──────────────────────────────────────────
  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/api/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });

      // Fetch data right after register so the app is populated immediately
      const { useProductStore, useCategoryStore } = await import("./index");
      await Promise.all([
        useProductStore.getState().fetchProducts(),
        useCategoryStore.getState().fetchCategories(),
      ]);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Registration failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ── Login ─────────────────────────────────────────────
  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/api/auth/login", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });

      // Fetch data right after login so the app is populated immediately
      const { useProductStore, useCategoryStore } = await import("./index");
      await Promise.all([
        useProductStore.getState().fetchProducts(),
        useCategoryStore.getState().fetchCategories(),
      ]);

      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Invalid email or password";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // ── Logout ────────────────────────────────────────────
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // swallow — we clear local state regardless
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
