// ============================================================
// 📁 src/store/index.js  (updated — error handling improved)
//
// The axios interceptor in lib/axios.js already handles 401s
// globally by calling logout(). So in these stores, we just
// need to let errors propagate — the interceptor will catch
// the 401 case automatically.
//
// LEARNING: Separation of concerns
//   - axios.js interceptor → handles auth errors (401)
//   - These stores → handle business logic errors (404, 500, etc.)
//   - Components → handle UI state (loading spinners, error messages)
// ============================================================

import { create } from "zustand";
import api from "../lib/axios";

// ── Theme Store ──────────────────────────────────────────────
// No auth needed here — theme is purely local preference
export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("theme") || "dark",

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    set({ theme: next });
  },

  initTheme: () => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("light", saved === "light");
    set({ theme: saved });
  },
}));

// ── Category Store ───────────────────────────────────────────
// All API calls here go through the axios instance in lib/axios.js
// which auto-attaches the JWT token via the request interceptor.
// If a 401 comes back, the response interceptor auto-logs out.
export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/api/categories");
      set({ categories: data.data, loading: false });
    } catch (err) {
      // 401 is handled by axios interceptor (auto-logout)
      // We just handle the display error here
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  createCategory: async (payload) => {
    // Throws on error — caller (CategoryModal) handles the toast
    const { data } = await api.post("/api/categories", payload);
    set((s) => ({ categories: [...s.categories, data.data] }));
    return data.data;
  },

  updateCategory: async (id, payload) => {
    const { data } = await api.put(`/api/categories/${id}`, payload);
    set((s) => ({
      categories: s.categories.map((c) => (c._id === id ? data.data : c)),
    }));
    return data.data;
  },

  deleteCategory: async (id) => {
    await api.delete(`/api/categories/${id}`);
    set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
  },
}));

// ── Product Store ────────────────────────────────────────────
export const useProductStore = create((set, get) => ({
  products: [],
  summary: { totalAmount: 0, totalQuantity: 0, totalProducts: 0 },
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },
  loading: false,
  error: null,
  search: "",
  selectedCategory: "all",

  setSearch: (search) =>
    set((s) => ({ search, pagination: { ...s.pagination, page: 1 } })),
  setSelectedCategory: (selectedCategory) =>
    set((s) => ({ selectedCategory, pagination: { ...s.pagination, page: 1 } })),
  setPage: (page) => set((s) => ({ pagination: { ...s.pagination, page } })),

  fetchProducts: async (params = {}) => {
    const state = get();
    const search = params.search ?? state.search;
    const category = params.category ?? state.selectedCategory;
    const page = params.page ?? state.pagination.page;

    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (category && category !== "all") queryParams.set("category", category);
      queryParams.set("page", page);
      queryParams.set("limit", 10);

      const { data } = await api.get(`/api/products?${queryParams}`);
      set({
        products: data.data,
        summary: data.summary,
        pagination: data.pagination,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  createProduct: async (payload) => {
    const isFormData = payload instanceof FormData;
    const { data } = await api.post("/api/products", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    await get().fetchProducts();
    return data.data;
  },

  updateProduct: async (id, payload) => {
    const isFormData = payload instanceof FormData;
    const { data } = await api.put(`/api/products/${id}`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    await get().fetchProducts();
    return data.data;
  },

  deleteProduct: async (id) => {
    await api.delete(`/api/products/${id}`);
    await get().fetchProducts();
  },
}));
