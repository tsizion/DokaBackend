const express = require("express");
const router = express.Router();
const {
  CreateOrUpdate,
  ReadAll,
  ReadOne,
  Update,
  Delete,
  MyCart,
  RemoveFromCart,
} = require("../controllers/cartControllers");
const { protectUser, protectAdmin } = require("../../middleware/authorization");

router.post("/AddToCart", protectUser, CreateOrUpdate);
// router.post("/RemoveFromCart", protectUser, RemoveFromCart);
router.get("/", ReadAll);
router.get("/MyCart", protectUser, MyCart);
router.get("/:id", ReadOne);
router.delete("/:id", Delete);

module.exports = router;
