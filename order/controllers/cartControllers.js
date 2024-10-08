const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const Cart = require("../models/cartModel");
const Product = require("../../Product/models/productModel");

exports.CreateOrUpdate = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const userId = req.user; // Get the user ID from the logged-in user (middleware)
  const { products } = req.body; // Get the products from the request body

  // Check if products array is valid
  if (!products || products.length === 0) {
    return next(new AppError("No products provided", 400));
  }

  // Initialize total price
  let totalPrice = 0;

  // Check if the products exist and calculate total price
  for (let productItem of products) {
    const product = await Product.findById(productItem.productId);
    if (!product) {
      return next(
        new AppError(`Product with ID ${productItem.productId} not found`, 404)
      );
    }

    if (!productItem.quantity || productItem.quantity <= 0) {
      return next(
        new AppError("Product quantity must be a positive number", 400)
      );
    }

    // Calculate total price for each product
    totalPrice += product.price * productItem.quantity;
  }

  // Check if the user already has a cart
  let cart = await Cart.findOne({ userId });

  if (cart) {
    // If the cart exists, overwrite it with the new products
    cart.products = products; // Replace the old products
    cart.totalPrice = totalPrice; // Update the total price
    await cart.save();
  } else {
    // Create a new cart if it does not exist
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

exports.RemoveFromCart = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const userId = req.user; // Get the user ID from the logged-in user (middleware)
  const { productId } = req.body; // Get the product ID from the request body

  // Find the user's cart
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("Cart not found for this user", 404));
  }

  // Check if the product exists in the cart
  const productIndex = cart.products.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (productIndex === -1) {
    return next(new AppError("Product not found in your cart", 404));
  }

  // Get the removed product details
  const removedProduct = cart.products[productIndex];

  // Find the product details in the database to get the price
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Deduct the total price for all quantities of this product
  cart.totalPrice -= product.price * removedProduct.quantity;

  // Remove the product from the cart
  cart.products.splice(productIndex, 1);

  // Ensure totalPrice doesn't go negative
  if (cart.totalPrice < 0) cart.totalPrice = 0;

  // Save the updated cart
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product removed from cart",
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
exports.MyCart = catchAsync(async (req, res, next) => {
  const userId = req.user; // Get the user ID from the logged-in user (middleware)

  // Find the user's cart
  const cart = await Cart.findOne({ userId }).populate({
    path: "products.productId",
    select: "name price category", // Only select relevant product fields
    populate: {
      path: "category", // Populate category name
      select: "name",
    },
  });

  // Check if the cart exists
  if (!cart) {
    return next(new AppError("Cart not found for this user", 404));
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
