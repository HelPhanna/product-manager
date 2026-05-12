import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store";
import { useAuthStore } from "../features/auth/store/authStore";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => !!s.user);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => !!s.user);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function Background() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="fixed top-0 left-1/3 w-[600px] h-[300px] blur-[120px] pointer-events-none rounded-full"
        style={{ backgroundColor: "var(--glow-color)" }}
      />
    </>
  );
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const authChecked = useAuthStore((s) => s.authChecked);
  const isAuthenticated = useAuthStore((s) => !!s.user);

  useEffect(() => {
    initTheme();
    checkAuth();
  }, [checkAuth, initTheme]);

  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-current/20 border-t-current animate-spin" />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Checking your session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Background />

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}




