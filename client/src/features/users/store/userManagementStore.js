import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../../../shared/api/axios";
import { useAuthStore } from "../../auth/store/authStore";

export const useUserManagementStore = create((set, get) => ({
  users: [],
  loading: false,
  actionLoadingId: null,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/api/users");
      set({ users: data.data ?? [], loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to load users",
      });
    }
  },

  updateUserRole: async (id, role) => {
    set({ actionLoadingId: id });
    try {
      const { data } = await api.patch(`/api/users/${id}/role`, { role });
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? data.data : user)),
        actionLoadingId: null,
      }));

      const authState = useAuthStore.getState();
      if (authState.user?.id === id) {
        authState.setUser(data.data);
      }

      toast.success(`Role changed to ${role}`);
      return { success: true };
    } catch (err) {
      set({ actionLoadingId: null });
      const message =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "Failed to update role";
      toast.error(message);
      return { success: false, message };
    }
  },

  deleteUser: async (id) => {
    set({ actionLoadingId: id });
    try {
      await api.delete(`/api/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        actionLoadingId: null,
      }));
      toast.success("User deleted successfully");
      return { success: true };
    } catch (err) {
      set({ actionLoadingId: null });
      const message =
        err.response?.data?.message || "Failed to delete user";
      toast.error(message);
      return { success: false, message };
    }
  },

  reset: () => set({ users: [], loading: false, actionLoadingId: null, error: null }),
}));
