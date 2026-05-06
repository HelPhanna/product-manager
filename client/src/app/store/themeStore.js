import { create } from "zustand";

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
