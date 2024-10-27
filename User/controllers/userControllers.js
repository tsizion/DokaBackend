const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const User = require("../models/usermodel");
const DeletedUser = require("../models/deletedUser");
const authUtils = require("../../Utils/authUtils");

// Create a new user
exports.Create = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Create the user
  const newUser = await User.create(req.body);

  // Generate a token for the new user
  const token = await authUtils.signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token, // Include the token in the response
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
exports.ReadMe = catchAsync(async (req, res, next) => {
  // The user's ID is already attached to req.user by the protectUser middleware
  const user = await User.findById(req.user);

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

exports.Update = catchAsync(async (req, res, next) => {
  const updateFields = req.body;

  // Ensure validation is done
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  // Find and update the authenticated user by their ID from the middleware
  const updatedUser = await User.findByIdAndUpdate(req.user, updateFields, {
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
  const user = await User.findById(req.user);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Use the provided reason or a default message
  const deletionReason = req.body.deletionReason || "No reason provided";

  // Save user data to DeletedUser collection with a custom deletion reason
  await DeletedUser.create({
    FullName: user.FullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    address: user.address,
    deletionReason: deletionReason,
  });

  // Delete the user from the User collection
  await User.findByIdAndDelete(req.user._id);

  res.status(200).json({
    status: "success",
    message: "User successfully deleted",
    data: null,
  });
});
exports.DeleteByAdmin = catchAsync(async (req, res, next) => {
  // Get the user by ID from the request parameters (since admin can delete any user)
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Use the provided reason or a default message
  const deletionReason = req.body.deletionReason || "Deleted by admin";

  // Save user data to DeletedUser collection with the admin information
  await DeletedUser.create({
    FullName: user.FullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    address: user.address,
    deletionReason: deletionReason,
    deletedByAdmin: true,
    adminId: req.admin.id, // Admin's ID from middleware
    adminName: `${req.admin.firstName} ${req.admin.lastName}`, // Admin's full name from middleware
  });

  // Delete the user from the User collection
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "User successfully deleted by admin",
    data: null,
  });
});
