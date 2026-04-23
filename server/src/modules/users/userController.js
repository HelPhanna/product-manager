const mongoose = require("mongoose");
const User = require("../../shared/models/User");
const { ROLES } = require("../../shared/models/User");
const { updateUserRoleSchema } = require("./userValidator");

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users.map((user) => user.toPublicJSON()),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const result = updateUserRoleSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(targetUser._id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "Super admin cannot change their own role",
      });
    }

    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Super admin role cannot be changed",
      });
    }

    targetUser.role = result.data.role;
    await targetUser.save();

    res.json({
      success: true,
      message: `Role updated to ${targetUser.role}`,
      data: targetUser.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(targetUser._id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "Super admin cannot delete their own account",
      });
    }

    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Super admin account cannot be deleted",
      });
    }

    await targetUser.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
