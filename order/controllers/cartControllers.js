const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const Cart = require("../models/cartModel");
const Product = require("../../Product/models/productModel");

// Create a new cart for a user (or update existing cart)
exports.CreateOrUpdate = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { userId, products } = req.body;

  // Check if the products exist and calculate total price
  let totalPrice = 0;
  for (let productItem of products) {
    const product = await Product.findById(productItem.productId);
    if (!product) {
      return next(
        new AppError(`Product with ID ${productItem.productId} not found`, 404)
      );
    }
    totalPrice += product.price * productItem.quantity;
  }

  // Check if the user already has a cart
  let cart = await Cart.findOne({ userId });

  if (cart) {
    // Update the existing cart
    cart.products = products;
    cart.totalPrice = totalPrice;
    await cart.save();
  } else {
    // Create a new cart
    cart = await Cart.create({
      userId,
      products,
      totalPrice,
    });
  }

  res.status(201).json({
    status: "success",
    data: {
      cart,
    },
  });
});

// Read all carts
exports.ReadAll = catchAsync(async (req, res, next) => {
  const carts = await Cart.find()
    .populate({
      path: "userId",
      select: "FullName email", // Only select relevant user fields
    })
    .populate({
      path: "products.productId",
      select: "name price category", // Only select relevant product fields
      populate: {
        path: "category", // Populate category name
        select: "name",
      },
    });

  // Format the cart products to include only desired fields
  const formattedCarts = carts.map((cart) => ({
    _id: cart._id,
    userId: cart.userId,
    products: cart.products.map((productItem) => ({
      name: productItem.productId.name,
      price: productItem.productId.price,
      category: productItem.productId.category.name,
      quantity: productItem.quantity,
    })),
    totalPrice: cart.totalPrice,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  }));

  res.status(200).json({
    status: "success",
    results: formattedCarts.length,
    data: {
      carts: formattedCarts,
    },
  });
});

// Read a single cart by User ID
// exports.ReadOne = catchAsync(async (req, res, next) => {
//   const cart = await Cart.findOne({ userId: req.params.userId })
//     .populate({
//       path: "userId",
//       select: "FullName email", // Only select relevant user fields
//     })
//     .populate({
//       path: "products.productId",
//       select: "name price category", // Only select relevant product fields
//       populate: {
//         path: "category", // Populate category name
//         select: "name",
//       },
//     });

//   if (!cart) {
//     return next(new AppError("Cart not found for this user", 404));
//   }

//   // Format the cart products to include only desired fields
//   const formattedCart = {
//     _id: cart._id,
//     userId: cart.userId,
//     products: cart.products.map((productItem) => ({
//       name: productItem.productId.name,
//       price: productItem.productId.price,
//       category: productItem.productId.category.name,
//       quantity: productItem.quantity,
//     })),
//     totalPrice: cart.totalPrice,
//     createdAt: cart.createdAt,
//     updatedAt: cart.updatedAt,
//   };

//   res.status(200).json({
//     status: "success",
//     data: {
//       cart: formattedCart,
//     },
//   });
// });
exports.ReadOne = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.id)
    .populate({
      path: "userId",
      select: "FullName email", // Only select relevant user fields
    })
    .populate({
      path: "products.productId",
      select: "name price category", // Only select relevant product fields
      populate: {
        path: "category", // Populate category name
        select: "name",
      },
    });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Format the cart products to include only desired fields
  const formattedCart = {
    _id: cart._id,
    userId: cart.userId,
    products: cart.products.map((productItem) => ({
      name: productItem.productId.name,
      price: productItem.productId.price,
      category: productItem.productId.category.name,
      quantity: productItem.quantity,
    })),
    totalPrice: cart.totalPrice,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };

  res.status(200).json({
    status: "success",
    data: {
      cart: formattedCart,
    },
  });
});

// Update a cart (Add/Remove products)
exports.Update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { products } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Find the cart by its ObjectId
  let cart = await Cart.findById(id).populate("products.productId");

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Check if the products exist and calculate total price
  let totalPrice = 0;
  for (let productItem of products) {
    const product = await Product.findById(productItem.productId);
    if (!product) {
      return next(
        new AppError(`Product with ID ${productItem.productId} not found`, 404)
      );
    }
    totalPrice += product.price * productItem.quantity;
  }

  // Update the cart
  cart.products = products;
  cart.totalPrice = totalPrice;
  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

// Delete a cart by User ID
exports.Delete = catchAsync(async (req, res, next) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Cart successfully deleted",
    data: null,
  });
});
