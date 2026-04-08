// ============================================================
// 📁 index.js  (updated — main server entry point)
//
// New additions:
//   - helmet          → sets HTTP security headers automatically
//   - express-rate-limit → limits how many requests per IP/time
//   - /api/auth routes → register, login, get profile
// ============================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// 🔒 HELMET — Security HTTP Headers
//
// Helmet sets various HTTP response headers that help
// protect against common web vulnerabilities.
//
// Examples of what helmet does automatically:
//   Content-Security-Policy → prevents XSS attacks
//     (controls which scripts/styles can run on a page)
//   X-Frame-Options: DENY   → prevents clickjacking
//     (stops your site from being embedded in iframes)
//   X-Content-Type-Options  → prevents MIME sniffing
//     (browser won't guess file types, only uses declared type)
//   Strict-Transport-Security → forces HTTPS
//
// It's one line of code that handles many security holes.
// ─────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────
// 🚦 RATE LIMITING — express-rate-limit
//
// Prevents:
//   - Brute force attacks (trying thousands of passwords)
//   - DoS (Denial of Service) attacks (flooding the server)
//   - API abuse (scraping all your data quickly)
//
// We use TWO limiters:
//   1. globalLimiter  → applies to ALL routes (loose limit)
//   2. authLimiter    → applies ONLY to /api/auth (strict limit)
//      because login/register are the most sensitive endpoints
// ─────────────────────────────────────────────

// Global limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // max 100 requests per window per IP
  standardHeaders: true,     // send RateLimit-* headers so clients know their quota
  legacyHeaders: false,      // don't send the older X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

// Auth limiter: stricter — 10 attempts per 15 minutes
// This makes brute-force login attacks very slow/ineffective
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again in 15 minutes.",
  },
});

// Apply global limit to all requests
app.use(globalLimiter);

// ─────────────────────────────────────────────
// Standard Middleware
// ─────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Auth routes — stricter rate limit applied here only
app.use("/api/auth", authLimiter, authRoutes);

// Product and category routes — JWT protection inside each route file
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Initialize database connection and start the Express server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

// Entry point — run the server
startServer();
