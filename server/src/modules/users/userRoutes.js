const express = require("express");
const router = express.Router();

const { listUsers, updateUserRole, deleteUser } = require("./userController");
const { authenticate, authorize } = require("../../shared/middleware/authMiddleware");
const { ROLES } = require("../../shared/models/User");

router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.get("/", listUsers);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
