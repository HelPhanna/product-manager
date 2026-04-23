// ============================================================
// 📁 controllers/authController.js
// Handles: register, login, and get current user profile.
//
// Key concepts:
//   - JWT (JSON Web Token) → a signed token sent to the client
//     to prove identity on future requests
//   - bcrypt               → password hashing (done in User model)
//   - zod                  → validates that incoming data has the
//     correct shape/types before we touch the database
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../../shared/models/User");
const { ROLES, normalizeRole } = require("../../shared/models/User");
const { registerSchema, loginSchema } = require("./authValidator");

const shouldBeSuperAdmin = (email) =>
  Boolean(process.env.SUPER_ADMIN_EMAIL) &&
  email?.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();

// ─────────────────────────────────────────────
// 🎟️ HELPER: Generate a JWT token
//
// JWT Structure: three Base64-encoded parts joined by dots
//   Header.Payload.Signature
//
//   Header   → algorithm info ("HS256")
//   Payload  → data we embed (userId, role) — NOT encrypted, just signed!
//   Signature→ proof the token hasn't been tampered with
//
// jwt.sign(payload, secret, options)
//   payload  → data to embed in the token
//   secret   → secret key used to sign (from .env — keep it private!)
//   expiresIn→ token expires after this time ("7d" = 7 days)
//
// ⚠️ IMPORTANT: The payload is Base64-encoded, NOT encrypted.
//    Anyone can decode it. Never put sensitive info (passwords, etc.) in JWT.
// ─────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role: normalizeRole(role) }, // payload: what we embed in the token
    process.env.JWT_SECRET,       // secret: used to sign + verify
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // expiry
  );
};

// ─────────────────────────────────────────────
// 📝 REGISTER
// POST /api/auth/register
//
// Flow:
//   1. Validate input with Zod
//   2. Check if username/email already taken
//   3. Create user (password is hashed by the pre-save hook)
//   4. Generate JWT and return it
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    // ── Step 1: Validate input using Zod ──────────────────
    // safeParse() returns { success: true, data } or { success: false, error }
    // This is safer than parse() which throws on failure
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      // Zod gives us a detailed error list — format it into readable messages
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),  // e.g., "email" or "password"
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { username, email, password } = result.data;

    // ── Step 2: Check for duplicates ──────────────────────
    // We check both email and username in one query using $or
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({
        success: false,
        message: `${field} is already registered`,
      });
    }

    // ── Step 3: Create user ───────────────────────────────
    // Password will be hashed automatically by the pre-save hook
    // in User.js — we don't hash it here manually.
    const user = await User.create({
      username,
      email,
      password,
      role: shouldBeSuperAdmin(email) ? ROLES.SUPER_ADMIN : ROLES.USER,
    });

    // ── Step 4: Generate token and respond ────────────────
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,             // client should store this and send it with future requests
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 🔑 LOGIN
// POST /api/auth/login
//
// Flow:
//   1. Validate input with Zod
//   2. Find user by email (include password with .select("+password"))
//   3. Compare password using bcrypt
//   4. Generate JWT and return it
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    // ── Step 1: Validate input ────────────────────────────
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { email, password } = result.data;

    // ── Step 2: Find user and include the password ────────
    // Remember: password has select: false in the schema.
    // We must explicitly request it with .select("+password")
    const user = await User.findOne({ email }).select("+password");

    // ── Step 3: Verify password ───────────────────────────
    // We use a vague message on purpose ("Invalid credentials")
    // so attackers can't tell whether the email or password was wrong.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials", // intentionally vague
      });
    }

    // Check if account is disabled
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    if (shouldBeSuperAdmin(user.email) && normalizeRole(user.role) !== ROLES.SUPER_ADMIN) {
      user.role = ROLES.SUPER_ADMIN;
      await user.save();
    }

    // ── Step 4: Generate token ─────────────────────────────
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 👤 GET CURRENT USER (Me)
// GET /api/auth/me
//
// This route is protected — only accessible with a valid JWT.
// The authenticate middleware (in authMiddleware.js) runs first
// and attaches req.user before this function runs.
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    // req.user.userId was set by the authenticate middleware
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
