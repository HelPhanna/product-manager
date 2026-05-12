const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../../common/middleware/authMiddleware");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", authenticate, getAllCategories);
router.get("/:id", authenticate, getCategoryById);

router.post("/", authenticate, authorize("super_admin", "admin"), createCategory);
router.put("/:id", authenticate, authorize("super_admin", "admin"), updateCategory);
router.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteCategory);

module.exports = router;


