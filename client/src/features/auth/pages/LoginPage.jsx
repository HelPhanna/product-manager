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
      result = await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
    }

    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
  };

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

