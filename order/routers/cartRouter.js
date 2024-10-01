const express = require("express");
const router = express.Router();
const {
  CreateOrUpdate,
  ReadAll,
  ReadOne,
  Update,
  Delete,
} = require("../controllers/cartControllers");

router.post("/", CreateOrUpdate);

router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.patch("/:id", Update);
router.delete("/:id", Delete);

module.exports = router;
