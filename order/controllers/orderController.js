const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const Order = require("../models/orderModel");
const Product = require("../../Product/models/productModel");

// Create a new order
exports.Create = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { userId, products } = req.body;

  // Check if products exist and calculate total price
  let totalPrice = 0;
  const updatedProducts = [];

  for (let productItem of products) {
    const product = await Product.findById(productItem.productId);
    if (!product) {
      return next(
        new AppError(`Product with ID ${productItem.productId} not found`, 404)
      );
    }

    // Ensure that the requested quantity does not exceed the stock
    if (productItem.quantity > product.stock) {
      return next(
        new AppError(
          `Requested quantity for product ${product.name} exceeds available stock`,
          400
        )
      );
    }

    totalPrice += product.price * productItem.quantity;

    // Push the updated product info to the products array
    updatedProducts.push({
      productId: product._id,
      quantity: productItem.quantity,
    });
  }

  // Create the order
  const newOrder = await Order.create({
    userId,
    products: updatedProducts,
    totalPrice,
    paymentStatus: req.body.paymentStatus || "Pending",
    deliveryStatus: req.body.deliveryStatus || "Pending",
  });

  res.status(201).json({
    status: "success",
    data: {
      order: newOrder,
    },
  });
});

// Read all orders
exports.ReadAll = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate("userId products.productId");

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Read a single order by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "userId products.productId"
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

// Update an order's delivery status

// Update delivery status and/or payment status
exports.UpdateDeliveryStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deliveryStatus, paymentStatus } = req.body;

  // Validation - you can choose to validate if either field is present
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Create an update object based on the provided fields
  const updateFields = {};
  if (deliveryStatus) {
    updateFields.deliveryStatus = deliveryStatus;
  }
  if (paymentStatus) {
    updateFields.paymentStatus = paymentStatus;
  }

  // Only update if there's something to update
  if (Object.keys(updateFields).length === 0) {
    return next(new AppError("No fields to update", 400));
  }

  const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  }).populate("userId products.productId");

  if (!updatedOrder) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder,
    },
  });
});

// Delete an order by ID
exports.Delete = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Order successfully deleted",
    data: null,
  });
});
