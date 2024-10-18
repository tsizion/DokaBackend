const express = require("express");
const router = express.Router();
const {
  Create,
  ReadAll,
  ReadOne,
  Update,
  Delete,
  BulkCreate,
} = require("../controllers/productControllers");
const { protectAdmin } = require("../../middleware/authorization");
router.post("/", Create);
router.post("/bulk", BulkCreate);
router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.patch("/:id", protectAdmin, Update);
router.delete("/:id", Delete);

module.exports = router;
