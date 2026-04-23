// ============================================================
// 📁 middleware/authMiddleware.js
// Two middleware functions:
//   1. authenticate → verifies the JWT token
//   2. authorize    → checks if the user has the required role
//
// 🤔 WHAT IS MIDDLEWARE?
// Middleware is a function that runs BETWEEN the HTTP request
// arriving and the route handler running.
//
//   Request → [middleware 1] → [middleware 2] → [route handler] → Response
//
// Each middleware can:
//   - Let the request through:   call next()
//   - Block the request:         call res.status(401).json(...)
//   - Attach data to the request: req.user = { ... }
// ============================================================

const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────
// 🛡️ MIDDLEWARE 1: authenticate
//
// Verifies the JWT token sent by the client.
// If valid → extracts user info and attaches it to req.user
// If invalid → rejects the request with 401 Unauthorized
//
// HOW CLIENTS SEND THE TOKEN:
//   HTTP Header:  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//
// The "Bearer" prefix is a convention (RFC 6750).
// We strip it and get the actual token.
// ─────────────────────────────────────────────
exports.authenticate = (req, res, next) => {
  try {
    // ── Step 1: Extract the token from the header ──────────
    const authHeader = req.headers.authorization;

    // Check the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // "Bearer eyJhbG..." → split by space → ["Bearer", "eyJhbG..."]
    const token = authHeader.split(" ")[1];

    // ── Step 2: Verify the token ───────────────────────────
    // jwt.verify() does two things:
    //   a) Checks the signature (was it signed with our secret?)
    //   b) Checks expiry (is it still valid?)
    //
    // If either check fails, it throws an error (caught below).
    // If both pass, it returns the decoded payload:
    //   { userId: "...", role: "admin", iat: ..., exp: ... }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Step 3: Attach user info to req ───────────────────
    // Now any route handler after this middleware can use req.user
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next(); // pass control to the next middleware / route handler

  } catch (err) {
    // jwt.verify throws specific errors we can handle:
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
    // Unexpected error
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

// ─────────────────────────────────────────────
// 🎭 MIDDLEWARE 2: authorize(...roles)
//
// This is a "middleware factory" — a function that RETURNS
// a middleware function. This lets us pass arguments to it.
//
// Usage in routes:
//   router.delete("/:id", authenticate, authorize("admin"), deleteProduct)
//
// This means:
//   1. authenticate runs → verifies JWT, sets req.user
//   2. authorize("admin") runs → checks req.user.role === "admin"
//   3. deleteProduct runs → only if both above passed
//
// authorize("admin", "viewer") → allows EITHER role
// ─────────────────────────────────────────────
exports.authorize = (...roles) => {
  // This is the actual middleware function returned
  return (req, res, next) => {
    // req.user was set by authenticate — always run authenticate first!
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Check if the user's role is in the allowed roles list
    // roles is an array like ["admin"] or ["admin", "viewer"]
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        // 403 Forbidden = authenticated but not allowed
        success: false,
        message: `Access denied. Requires role: ${roles.join(" or ")}`,
      });
    }

    next(); // role is allowed → proceed
  };
};
