const express = require("express");
const router = express.Router();
const { upload } = require("../../../common/middleware/upload");
const { authenticate, authorize } = require("../../../common/middleware/authMiddleware");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", authenticate, getAllProducts);
router.get("/:id", authenticate, getProductById);

router.post("/", authenticate, authorize("super_admin", "admin"), upload.single("image"), createProduct);
router.put("/:id", authenticate, authorize("super_admin", "admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticate, authorize("super_admin", "admin"), deleteProduct);

module.exports = router;



