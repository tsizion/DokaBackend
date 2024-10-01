const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const Delivery = require("../models/deliveryModel");
const Order = require("../models/orderModel");

// Create a new delivery record
exports.Create = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { orderId, courier, estimatedDeliveryTime } = req.body;

  // Check if the order ID exists
  const orderExists = await Order.findById(orderId);
  if (!orderExists) {
    return next(new AppError("Order not found", 404));
  }

  // Create the delivery record
  const newDelivery = await Delivery.create({
    orderId,
    courier,
    status: req.body.status || "Pending",
    estimatedDeliveryTime,
  });

  res.status(201).json({
    status: "success",
    data: {
      delivery: newDelivery,
    },
  });
});

// Read all deliveries
exports.ReadAll = catchAsync(async (req, res, next) => {
  const deliveries = await Delivery.find()
    .populate("orderId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: deliveries.length,
    data: {
      deliveries,
    },
  });
});

// Read a single delivery by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const delivery = await Delivery.findById(req.params.id).populate("orderId");

  if (!delivery) {
    return next(new AppError("Delivery not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      delivery,
    },
  });
});

// Update delivery status
exports.Update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const updatedDelivery = await Delivery.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("orderId");

  if (!updatedDelivery) {
    return next(new AppError("Delivery not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      delivery: updatedDelivery,
    },
  });
});

// Delete a delivery record by ID
exports.Delete = catchAsync(async (req, res, next) => {
  const delivery = await Delivery.findById(req.params.id);

  if (!delivery) {
    return next(new AppError("Delivery not found", 404));
  }

  await Delivery.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Delivery record successfully deleted",
    data: null,
  });
});
