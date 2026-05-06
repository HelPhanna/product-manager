import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Sun, Moon, ShoppingCart, LogOut, Shield, Eye } from "lucide-react";
import { useThemeStore } from "../../app/store";
import { useAuthStore } from "../../features/auth/store/authStore";
import CategoryModal from "../../features/categories/components/CategoryModal";

export default function Navbar() {
  const [showCatModal, setShowCatModal] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout, isAdmin } = useAuthStore();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header
        className="glass sticky top-0 z-40"
        style={{ borderBottom: "1px solid var(--border-base)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-muted)",
                border: "1px solid var(--border-input)",
              }}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark"
                ? <Sun size={15} style={{ color: "var(--amber)" }} />
                : <Moon size={15} style={{ color: "var(--accent)" }} />}
            </button>

            {isAdmin() && (
              <button onClick={() => setShowCatModal(true)} className="btn-secondary">
                <Tag size={14} />
                Manage Categories
              </button>
            )}

            {user && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  border: "1px solid var(--border-input)",
                }}
              >
                {isAdmin()
                  ? <Shield size={13} style={{ color: "var(--accent)" }} />
                  : <Eye size={13} style={{ color: "var(--amber)" }} />}

                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {user.username}
                </span>

                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={
                    isAdmin()
                      ? { backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }
                      : { backgroundColor: "rgba(251,191,36,0.12)", color: "var(--amber)" }
                  }
                >
                  {user.role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: "rgba(251,113,133,0.08)",
                border: "1px solid rgba(251,113,133,0.2)",
              }}
              title="Log out"
            >
              <LogOut size={15} style={{ color: "var(--red)" }} />
            </button>
          </div>
        </div>
      </header>

      {showCatModal && <CategoryModal onClose={() => setShowCatModal(false)} />}
    </>
  );
}



