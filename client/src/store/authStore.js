// ============================================================
// 📁 src/store/authStore.js  (updated)
//
// Changes:
//   1. register() no longer accepts or sends a role.
//      The server always assigns "viewer" by default.
//      This matches real-world apps where users can't
//      self-promote to admin.
//
//   2. logout() no longer calls toast + clears state only.
//      Navigation to /login is handled in Navbar.jsx using
//      useNavigate — because the store doesn't have access
//      to the router. Stores are plain JS, not React components,
//      so hooks like useNavigate can't be called inside them.
//
// LEARNING: Why can't the store call useNavigate()?
// React hooks (useNavigate, useLocation, useState, etc.) can
// ONLY be called inside React function components or custom hooks.
// The store is a plain JavaScript object created by Zustand —
// it's not a component, so hooks don't work there.
// Solution: handle navigation in the component (Navbar) that
// calls logout(), not inside the store itself.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";
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

      // ── REGISTER ─────────────────────────────────────────
      // No role param — server defaults new users to "viewer".
      // Returns { success: true } or { success: false, message }
      // so LoginPage can decide whether to navigate.
      register: async ({ username, email, password }) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/api/auth/register", {
            username,
            email,
            password,
            // role intentionally omitted — server assigns "viewer"
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

      // ── LOGIN ─────────────────────────────────────────────
      // Returns { success: true } or { success: false, message }
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

      // ── LOGOUT ───────────────────────────────────────────
      // Clears user + token. Navigation to /login happens
      // in Navbar.jsx (the component calling this), because
      // useNavigate() can only be used inside React components.
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
