import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import api from "../../../shared/api/axios";

const normalizeRole = (role) => (role === "viewer" ? "user" : role);

const normalizeUser = (user) =>
  user
    ? {
        ...user,
        role: normalizeRole(user.role),
      }
    : null;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      isAuthenticated: () => !!get().token,
      isSuperAdmin: () => get().user?.role === "super_admin",
      isAdmin: () => ["admin", "super_admin"].includes(get().user?.role),
      isUser: () => get().user?.role === "user",

      register: async ({ username, email, password }) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/api/auth/register", {
            username,
            email,
            password,
          });

          set({
            user: normalizeUser(data.user),
            token: data.token,
            loading: false,
          });

          toast.success(`Welcome, ${data.user.username}!`);
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

          set({
            user: normalizeUser(data.user),
            token: data.token,
            loading: false,
          });

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

      setUser: (user) => set({ user: normalizeUser(user) }),

      logout: () => {
        set({ user: null, token: null });
        toast.success("Logged out successfully");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: normalizeUser(state.user),
        token: state.token,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        user: normalizeUser(persistedState?.user ?? currentState.user),
      }),
    }
  )
);
