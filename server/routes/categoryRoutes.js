// ============================================================
// 📁 routes/categoryRoutes.js  (updated with auth + RBAC)
//
// RBAC Policy for Categories:
//   GET  routes → any authenticated user (admin + viewer)
//   POST/PUT/DELETE → admin only
// ============================================================

const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// ── Read: any authenticated user ──────────────────────────
router.get("/", authenticate, getAllCategories);
router.get("/:id", authenticate, getCategoryById);

// ── Write: admin only ──────────────────────────────────────
router.post("/", authenticate, authorize("admin"), createCategory);
router.put("/:id", authenticate, authorize("admin"), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;
