// ============================================================
// 📁 validators/authValidator.js
// Input validation schemas using Zod.
//
// 🤔 WHY ZOD?
// Without validation, users can send anything:
//   { email: 123, password: null, role: "superadmin" }
// Zod lets us declare exactly what shape we expect,
// and rejects anything that doesn't match — before
// we ever touch the database.
//
// Think of Zod schemas like a contract:
//   "I expect an object with an email (string), a password
//    (string, min 6 chars), and optionally a role (admin|viewer)."
// ============================================================

const { z } = require("zod");
const { ROLES, PUBLIC_ROLES } = require("../../shared/models/User");

// ─────────────────────────────────────────────
// 📝 Register Schema
//
// z.object({...}) → defines an object with named fields
// z.string()      → must be a string
// .email()        → must be a valid email format
// .min(n)         → minimum length
// .max(n)         → maximum length
// .optional()     → field is not required
// .default()      → use this value if field is missing
// ─────────────────────────────────────────────
exports.registerSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .trim(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address")  // checks format like "x@y.z"
    .toLowerCase()                           // normalize before storing
    .trim(),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),

  // Public registration always creates a regular user.
  // We still validate an optional incoming role so older clients
  // don't break, but we ignore it in the controller.
  role: z
    .enum(PUBLIC_ROLES.filter((role) => role !== ROLES.SUPER_ADMIN), {
      errorMap: () => ({ message: "Role must be 'admin' or 'user'" }),
    })
    .optional()
    .default(ROLES.USER),
});

// ─────────────────────────────────────────────
// 🔑 Login Schema
//
// Login only needs email + password.
// Much simpler than register.
// ─────────────────────────────────────────────
exports.loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),  // min 1 here — the real check is at DB level
});
