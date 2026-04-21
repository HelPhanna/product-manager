// ============================================================
// 📁 src/pages/LoginPage.jsx  (updated)
//
// Changes from previous version:
//   1. Role select REMOVED — in a real app users don't pick
//      their own role. An admin assigns roles separately.
//      New users always register as "viewer" (set by the server default).
//
//   2. useNavigate added — after a successful login or register,
//      we now explicitly navigate to /dashboard.
//      Previously App.jsx did a conditional swap which felt odd on refresh.
//
// HOW useNavigate WORKS:
//   const navigate = useNavigate()
//   navigate("/dashboard")  → pushes /dashboard onto the browser history
//                             and renders the DashboardPage route
//   navigate("/dashboard", { replace: true })
//                           → replaces current history entry so the
//                             user can't press Back to return to /login
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, loading } = useAuthStore();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;

    if (tab === "login") {
      result = await login({ email: form.email, password: form.password });
    } else {
      // No role sent — server assigns "viewer" by default.
      // Admins are promoted separately (e.g. directly in the database
      // or via an admin panel — not through the public register form).
      result = await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
    }

    // On success → navigate to /dashboard.
    // replace: true → removes /login from history so Back button
    // doesn't bring them back to the login page.
    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
  };

  // Switch tab and reset the form so fields don't carry over
  const switchTab = (t) => {
    setTab(t);
    setForm({ username: "", email: "", password: "" });
    setShowPassword(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div
        className="glass-card w-full max-w-md rounded-2xl p-8"
        style={{ border: "1px solid var(--border-base)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <ShoppingCart size={22} className="text-white" />
          </div>
          <div className="text-center">
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Steav<span style={{ color: "var(--text-muted)" }}>-Store</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Product Manager
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ backgroundColor: "var(--bg-muted)" }}
        >
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200"
              style={
                tab === t
                  ? { backgroundColor: "var(--accent)", color: "#fff" }
                  : { color: "var(--text-secondary)" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Username — register only */}
          {tab === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. alice123"
                required
                className="input-field"
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="input-field"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                className="input-field w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : tab === "login" ? (
              <><LogIn size={15} /> Log In</>
            ) : (
              <><UserPlus size={15} /> Create Account</>
            )}
          </button>
        </form>

        {/* Switch tab hint */}
        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
          {tab === "login" ? (
            <>
              No account?{" "}
              <button onClick={() => switchTab("register")} style={{ color: "var(--accent)" }} className="font-medium hover:underline">
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => switchTab("login")} style={{ color: "var(--accent)" }} className="font-medium hover:underline">
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
