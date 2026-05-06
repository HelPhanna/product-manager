import { create } from "zustand";
import api from "../../shared/lib/apiClient";

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

