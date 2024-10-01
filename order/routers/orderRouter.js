const express = require("express");
const router = express.Router();
const {
  Create,
  ReadAll,
  ReadOne,
  UpdateDeliveryStatus,
  Delete,
} = require("../controllers/orderController");

router.post("/", Create);

router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.patch("/:id/UpdateStatus", UpdateDeliveryStatus);
router.delete("/:id", Delete);

module.exports = router;
