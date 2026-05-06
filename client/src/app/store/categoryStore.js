import { create } from "zustand";
import api from "../../shared/lib/apiClient";

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/api/categories");
      set({ categories: data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  createCategory: async (payload) => {
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

