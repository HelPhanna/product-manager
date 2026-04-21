// ============================================================
// 📁 routes/authRoutes.js
// Defines the URL endpoints for authentication.
//
// Route summary:
//   POST /api/auth/register → create a new user account
//   POST /api/auth/login    → log in, receive a JWT token
//   GET  /api/auth/me       → get current user info (protected)
// ============================================================

const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes — no token needed
router.post("/register", register);
router.post("/login", login);

// Protected route — must send a valid JWT in Authorization header
// authenticate middleware runs first, then getMe
router.get("/me", authenticate, getMe);

module.exports = router;
