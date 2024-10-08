const express = require("express");
const router = express.Router();
const {
  Create,
  ReadAll,
  ReadOne,
  Update,
  Delete,
  ReadMe,
  DeleteByAdmin,
} = require("../controllers/userControllers");
const { protectUser, protectAdmin } = require("../../middleware/authorization");

router.post("/", Create);
router.get("/", protectAdmin, ReadAll);
router.get("/me", protectUser, ReadMe);
router.get("/:id", protectAdmin, ReadOne);
router.patch("/", protectUser, Update);
router.delete("/", protectUser, Delete);
router.delete("/:id/admin", protectAdmin, DeleteByAdmin); // Admin can delete any user by ID

module.exports = router;
