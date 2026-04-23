// ============================================================
// 📁 routes/categoryRoutes.js  (updated with auth + RBAC)
//
// RBAC Policy for Categories:
//   GET  routes → any authenticated user (admin + viewer)
//   POST/PUT/DELETE → admin only
// ============================================================

const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../shared/middleware/authMiddleware");
const { ROLES } = require("../../shared/models/User");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./categoryController");

// ── Read: any authenticated user ──────────────────────────
router.get("/", authenticate, getAllCategories);
router.get("/:id", authenticate, getCategoryById);

// ── Write: admin only ──────────────────────────────────────
router.post("/", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createCategory);
router.put("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateCategory);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteCategory);

module.exports = router;
