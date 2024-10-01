const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const Category = require("../models/category");

// Create a new category
exports.Create = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  // Validate request data using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Create the category document in MongoDB
  const newCategory = await Category.create({ name });

  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

// Read all categories
exports.ReadAll = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

// Read a single category by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

// Update a category
exports.Update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  // Validate request data using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Find the category by ID and update the specified fields
  const updatedCategory = await Category.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!updatedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      category: updatedCategory,
    },
  });
});

// Delete a category by ID
exports.Delete = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Capture the category name before deletion
  const categoryName = category.name;

  // Delete the category
  await Category.findByIdAndDelete(req.params.id);

  // Respond with a success message that includes the category name
  res.status(200).json({
    status: "success",
    message: `Category "${categoryName}" successfully deleted`,
    data: null,
  });
});

// Bulk create categories
exports.BulkCreate = catchAsync(async (req, res, next) => {
  const categories = req.body; // Expecting an array of category objects

  // Validate that the request body is an array
  if (!Array.isArray(categories) || categories.length === 0) {
    return next(
      new AppError(
        "Invalid input data: an array of categories is required",
        400
      )
    );
  }

  // Check for duplicates in the request body
  const categoryNames = categories.map((cat) => cat.name.toLowerCase());
  const uniqueCategoryNames = new Set(categoryNames);

  if (categoryNames.length !== uniqueCategoryNames.size) {
    return next(new AppError("Duplicate category names are not allowed", 400));
  }

  // Create categories
  const newCategories = await Category.insertMany(categories);

  res.status(201).json({
    status: "success",
    data: {
      categories: newCategories,
    },
  });
});
