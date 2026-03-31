import { create } from "zustand";
import api from "../lib/axios";

const API = "/api";

// ── Theme Store ──────────────────────────────────────────
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

// ── Category Store ────────────────────────────────────────
export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`${API}/categories`);
      set({ categories: data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  createCategory: async (payload) => {
    const { data } = await api.post(`${API}/categories`, payload);
    set((s) => ({ categories: [...s.categories, data.data] }));
    return data.data;
  },

  updateCategory: async (id, payload) => {
    const { data } = await api.put(`${API}/categories/${id}`, payload);
    set((s) => ({
      categories: s.categories.map((c) => (c._id === id ? data.data : c)),
    }));
    return data.data;
  },

  deleteCategory: async (id) => {
    await api.delete(`${API}/categories/${id}`);
    set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
  },
}));

// ── Product Store ─────────────────────────────────────────
export const useProductStore = create((set, get) => ({
  products: [],
  summary: { totalAmount: 0, totalQuantity: 0, totalProducts: 0 },
  pagination: { total: 0, page: 1, limit: 20, pages: 1 },
  loading: false,
  error: null,
  search: "",
  selectedCategory: "all",

  setSearch: (search) => set({ search }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

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
      queryParams.set("limit", 20);

      const { data } = await api.get(`${API}/products?${queryParams}`);
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

  createProduct: async (formData) => {
    const { data } = await api.post(`${API}/products`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await get().fetchProducts();
    return data.data;
  },

  updateProduct: async (id, formData) => {
    const { data } = await api.put(`${API}/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await get().fetchProducts();
    return data.data;
  },

  deleteProduct: async (id) => {
    await api.delete(`${API}/products/${id}`);
    await get().fetchProducts();
  },
}));
