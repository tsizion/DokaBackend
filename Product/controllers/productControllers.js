const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const Product = require("../models/productModel");
const Category = require("../models/category");

exports.Create = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { category } = req.body;

  // Check if the category name exists (case insensitive)
  const categoryExists = await Category.findOne({
    name: { $regex: new RegExp(`^${category}$`, "i") },
  });
  if (!categoryExists) {
    return next(new AppError("Category not found", 404));
  }

  // Create the product
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

// Bulk create products
exports.BulkCreate = catchAsync(async (req, res, next) => {
  const products = req.body; // Expecting an array of product objects

  // Validate that the request body is an array
  if (!Array.isArray(products) || products.length === 0) {
    return next(
      new AppError("Invalid input data: an array of products is required", 400)
    );
  }

  // Check if the category names provided exist (case insensitive)
  const categoryNames = products.map((product) => product.category);
  const uniqueCategoryNames = [...new Set(categoryNames)];

  const categories = await Category.find({
    name: {
      $in: uniqueCategoryNames.map((name) => new RegExp(`^${name}$`, "i")),
    },
  });

  if (categories.length !== uniqueCategoryNames.length) {
    return next(new AppError("One or more categories not found", 404));
  }

  // Create products
  const newProducts = await Product.insertMany(products);

  res.status(201).json({
    status: "success",
    data: {
      products: newProducts,
    },
  });
});

// Read all products
exports.ReadAll = catchAsync(async (req, res, next) => {
  const products = await Product.find()
    .populate("category")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// Read a single product by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Update a product
exports.Update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Check if the category exists (if updating the category)
  if (updateFields.category) {
    const categoryExists = await Category.findById(updateFields.category);
    if (!categoryExists) {
      return next(new AppError("Category not found", 404));
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  }).populate("category");

  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});

// Delete a product by ID
exports.Delete = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Product successfully deleted",
    data: null,
  });
});
