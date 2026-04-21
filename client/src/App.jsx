// ============================================================
// 📁 src/App.jsx  (updated — real routes with react-router-dom)
//
// BEFORE: A simple if/else swap between LoginPage and ProductsPage.
//         The URL never changed — always stayed at "/".
//         Refresh on the dashboard went back to "/" which felt weird.
//
// AFTER:  Real URL-based routing:
//           /login     → LoginPage  (public)
//           /dashboard → ProductsPage (protected — needs login)
//           /          → redirects based on auth state
//
// HOW PROTECTED ROUTES WORK:
// <ProtectedRoute> wraps any page that needs a logged-in user.
// If the user IS logged in → render the page normally.
// If the user is NOT logged in → redirect to /login.
//
// The key difference from before:
//   Before → URL stayed "/" always, state swap felt like a glitch
//   Now    → URL changes to "/dashboard" after login,
//             "/login" after logout. Refresh keeps you where you are.
//
// COMPONENTS USED FROM REACT-ROUTER-DOM:
//   <Routes>         → the container for all route definitions
//   <Route>          → maps a URL path to a component
//   <Navigate>       → programmatic redirect (like a sign pointing elsewhere)
//   useNavigate()    → hook to redirect in code (e.g. after login success)
//   useLocation()    → hook to read the current URL
// ============================================================

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

// ─────────────────────────────────────────────
// 🛡️ ProtectedRoute component
//
// A wrapper that checks auth before rendering children.
// Usage:
//   <ProtectedRoute>
//     <DashboardPage />
//   </ProtectedRoute>
//
// If NOT logged in → <Navigate to="/login" /> sends user away.
// replace={true} → replaces the history entry so pressing
//   the back button doesn't loop them back to the protected page.
// ─────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ─────────────────────────────────────────────
// 🔓 PublicOnlyRoute component
//
// The opposite — only for guests (not logged in).
// If the user IS already logged in and tries to visit /login,
// redirect them straight to /dashboard.
//
// This prevents the weird case of a logged-in user
// seeing the login form when they type /login in the URL bar.
// ─────────────────────────────────────────────
function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Shared background decoration (grid + glow)
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

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Background />

      {/*
        Routes: react-router-dom looks at the current URL and renders
        the first <Route> whose path matches.

        Route map:
          /           → if logged in → /dashboard, else → /login
          /login      → LoginPage (but redirects to /dashboard if already logged in)
          /dashboard  → DashboardPage (redirects to /login if not logged in)
          *           → any unknown URL → redirect to /
      */}
      <Routes>

        {/* Root "/" → smart redirect based on auth state */}
        <Route
          path="/"
          element={
            <Navigate
              to={useAuthStore.getState().isAuthenticated() ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        {/* /login → only for guests; logged-in users get sent to /dashboard */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        {/* /dashboard → protected; guests get sent to /login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: any unknown URL → redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
}
