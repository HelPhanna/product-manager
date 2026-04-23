// ============================================================
// 📁 routes/productRoutes.js  (updated with auth + RBAC)
//
// RBAC Policy for Products:
//   GET    /         → any authenticated user (admin + viewer)
//   GET    /:id      → any authenticated user (admin + viewer)
//   POST   /         → admin only
//   PUT    /:id      → admin only
//   DELETE /:id      → admin only
//
// HOW THE CHAIN WORKS:
//   router.delete("/:id", authenticate, authorize("admin"), deleteProduct)
//
//   1. authenticate      → verifies JWT, sets req.user
//   2. authorize("admin")→ checks req.user.role === "admin"
//   3. deleteProduct     → runs only if both above passed
// ============================================================

const express = require("express");
const router = express.Router();
const { upload } = require("../../shared/middleware/upload");
const { authenticate, authorize } = require("../../shared/middleware/authMiddleware");
const { ROLES } = require("../../shared/models/User");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./productController");

// ── Read routes: any authenticated user ───────────────────
router.get("/", authenticate, getAllProducts);
router.get("/:id", authenticate, getProductById);

// ── Write routes: admin only ───────────────────────────────
router.post("/", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), upload.single("image"), createProduct);
router.put("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), upload.single("image"), updateProduct);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteProduct);

module.exports = router;
