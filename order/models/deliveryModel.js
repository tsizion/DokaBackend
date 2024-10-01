const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    courier: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Out for Delivery", "Delivered"],
      default: "Pending",
    },
    estimatedDeliveryTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", DeliverySchema);

module.exports = Delivery;
