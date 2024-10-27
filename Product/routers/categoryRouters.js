const express = require("express");
const router = express.Router();
const {
  Create,
  ReadAll,
  ReadOne,
  Update,
  Delete,
  BulkCreate,
  DeleteAll,
} = require("../controllers/categoryControllers");
const { protectUser, protectAdmin } = require("../../middleware/authorization");

router.post("/", Create);
router.post("/bulk", protectAdmin, BulkCreate);
router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.patch("/:id", protectAdmin, Update);
router.delete("/All", DeleteAll);
router.delete("/:id", protectAdmin, Delete);

module.exports = router;
