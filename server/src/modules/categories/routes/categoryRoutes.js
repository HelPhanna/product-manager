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

router.post("/", authenticate, authorize("admin"), createCategory);
router.put("/:id", authenticate, authorize("admin"), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;


