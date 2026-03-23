import { useState } from "react";
import { Package, Tag, Sun, Moon, ShoppingCart } from "lucide-react";
import { useThemeStore } from "../store";
import CategoryModal from "./CategoryModal";

export default function Navbar() {
  const [showCatModal, setShowCatModal] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <>
      <header
        className="glass sticky top-0 z-40"
        style={{ borderBottom: "1px solid var(--border-base)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Steav<span style={{ color: "var(--text-muted)" }}>-Store</span>
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-muted)",
                border: "1px solid var(--border-input)",
              }}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun size={15} style={{ color: "var(--amber)" }} />
              ) : (
                <Moon size={15} style={{ color: "var(--accent)" }} />
              )}
            </button>

            {/* Categories */}
            <button
              onClick={() => setShowCatModal(true)}
              className="btn-secondary"
            >
              <Tag size={14} />
              Manage Categories
            </button>
          </div>
        </div>
      </header>

      {showCatModal && <CategoryModal onClose={() => setShowCatModal(false)} />}
    </>
  );
}
