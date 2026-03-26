import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async (name, email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/profile");
      set({ user: res.data, checkingAuth: false });
    } catch {
      set({ user: null, checkingAuth: false });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;
    try {
      await api.post("/auth/refresh-token");
    } catch {
      set({ user: null });
    }
  },
}));

export default useAuthStore;