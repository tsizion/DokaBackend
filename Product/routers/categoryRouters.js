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

router.post("/", Create);
router.post("/bulk", BulkCreate);
router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.patch("/:id", Update);
router.delete("/:id", Delete);

module.exports = router;
