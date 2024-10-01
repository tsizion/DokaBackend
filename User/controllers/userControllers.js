const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const User = require("../models/usermodel");

// Create a new user
exports.Create = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Create the user
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// Read all users
exports.ReadAll = catchAsync(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Read a single user by ID
exports.ReadOne = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Update a user
exports.Update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
    new: true, // Return the updated document
    runValidators: true, // Ensure the updated fields pass the schema validators
  });

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Delete a user by ID
exports.Delete = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "User successfully deleted",
    data: null,
  });
});
