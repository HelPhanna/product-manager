// ============================================================
// 📁 models/User.js
// This file defines the shape of a "User" document in MongoDB.
//
// Key concepts used here:
//   - mongoose.Schema  → blueprint for user data
//   - bcrypt           → hashes passwords so raw passwords are NEVER stored
//   - RBAC roles       → each user has a role that decides what they can do
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// 🔐 ROLE-BASED ACCESS CONTROL (RBAC) CONCEPT
//
// RBAC = assign permissions to ROLES, not individuals.
// Instead of saying "Alice can delete products",
// we say "admins can delete products, Alice is an admin".
//
// Our two roles:
//   admin  → full CRUD on products AND categories
//   viewer → read-only (GET requests only)
// ─────────────────────────────────────────────
const ROLES = {
  ADMIN: "admin",
  VIEWER: "viewer",
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // no two users share a username
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // always store email in lowercase
      trim: true,
    },

    // ─────────────────────────────────────────────
    // 🔑 PASSWORD FIELD
    //
    // We NEVER store the raw password ("mySecret123").
    // bcrypt converts it to a "hash" like:
    //   "$2b$10$abc123xyz..."
    // A hash is a one-way transformation — you cannot
    // reverse it to get the original password.
    //
    // select: false → password is NOT returned in queries
    // by default (extra safety layer).
    // ─────────────────────────────────────────────
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // hidden from query results unless explicitly requested
    },

    // ─────────────────────────────────────────────
    // 🎭 ROLE FIELD (the heart of RBAC)
    //
    // enum → only these values are allowed.
    // Default is "viewer" — safest assumption for new users.
    // ─────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: [ROLES.ADMIN, ROLES.VIEWER],
        message: "Role must be either 'admin' or 'viewer'",
      },
      default: ROLES.VIEWER,
    },

    // Useful for disabling accounts without deleting them
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }, // adds createdAt + updatedAt automatically
);

// ─────────────────────────────────────────────
// 🔒 PRE-SAVE HOOK: Hash the password before saving
//
// This runs automatically BEFORE .save() hits the database.
// "this" refers to the user document being saved.
//
// WHY: So even if someone dumps your database, they only see
// hashes — not real passwords.
//
// isModified("password") → only re-hash if password changed
// (important for updates — don't re-hash a hash!)
//
// bcrypt.genSalt(10) → generates random "salt" (extra random data
// mixed into the hash so two users with the same password
// get different hashes). 10 = cost factor (higher = slower = safer).
// ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // skip if password unchanged

  const salt = await bcrypt.genSalt(10); // generate random salt
  this.password = await bcrypt.hash(this.password, salt); // hash the password
  next();
});

// ─────────────────────────────────────────────
// 🔍 INSTANCE METHOD: comparePassword
//
// Used during login to check if the entered password
// matches the stored hash.
//
// bcrypt.compare(plainText, hash) → returns true/false
// "this.password" is the stored hash from the database
// (remember we need to explicitly select it with .select("+password"))
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Export ROLES so other files can use the constants
// instead of typing raw strings like "admin" (typo-prone)
module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
