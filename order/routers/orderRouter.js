const express = require("express");
const router = express.Router();
const {
  Create,
  ReadAll,
  ReadOne,
  UpdateDeliveryStatus,
  Delete,
  MyOrders,
  MySingleOrder,
} = require("../controllers/orderController");
const { protectUser, protectAdmin } = require("../../middleware/authorization");

router.post("/", protectUser, Create);

router.get("/", ReadAll);
router.get("/MyOrders", protectUser, MyOrders);
router.get("/MyOrders/:id", protectUser, MySingleOrder);

router.get("/:id", ReadOne);
router.patch("/:id/UpdateStatus", UpdateDeliveryStatus);
router.delete("/:id", Delete);

module.exports = router;
