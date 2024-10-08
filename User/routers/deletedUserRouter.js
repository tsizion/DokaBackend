const express = require("express");
const {
  ReadAllDeletedUsers,
  ReadDeletedUserById,
  UpdateDeletedUser,
  DeleteDeletedUser,
} = require("../controllers/deletedUserControllers");
const { protectAdmin } = require("../../middleware/authorization");

const router = express.Router();

// Routes for DeletedUser
router.get("/", protectAdmin, ReadAllDeletedUsers);
router.get("/:id", protectAdmin, ReadDeletedUserById);
router.patch("/:id", protectAdmin, UpdateDeletedUser);
router.delete("/:id", protectAdmin, DeleteDeletedUser);

module.exports = router;
