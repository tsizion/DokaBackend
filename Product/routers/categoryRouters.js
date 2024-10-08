const express = require("express");
const router = express.Router();
const {
  Create,
  ReadAll,
  ReadOne,
  Update,
  Delete,
  BulkCreate,
} = require("../controllers/categoryControllers");
const { protectUser, protectAdmin } = require("../../middleware/authorization");

router.post("/", protectAdmin, Create);
router.post("/bulk", protectAdmin, BulkCreate);
router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.patch("/:id", protectAdmin, Update);
router.delete("/:id", protectAdmin, Delete);

module.exports = router;
