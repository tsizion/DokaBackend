const { validationResult } = require("express-validator");
const AppError = require("../../ErrorHandlers/appError");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const DeletedUser = require("../models/deletedUser");

// Create a new DeletedUser record
// exports.CreateDeletedUser = catchAsync(async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(new AppError("Validation failed", 400, errors.array()));
//   }

//   const newDeletedUser = await DeletedUser.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       deletedUser: newDeletedUser,
//     },
//   });
// });

// Read all DeletedUser records
exports.ReadAllDeletedUsers = catchAsync(async (req, res, next) => {
  const deletedUsers = await DeletedUser.find().sort({ deletedAt: -1 });

  res.status(200).json({
    status: "success",
    results: deletedUsers.length,
    data: {
      deletedUsers,
    },
  });
});

// Read a single DeletedUser by ID
exports.ReadDeletedUserById = catchAsync(async (req, res, next) => {
  const deletedUser = await DeletedUser.findById(req.params.id);

  if (!deletedUser) {
    return next(new AppError("Deleted user not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      deletedUser,
    },
  });
});

// Update a DeletedUser record
exports.UpdateDeletedUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const updatedDeletedUser = await DeletedUser.findByIdAndUpdate(
    id,
    updateFields,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedDeletedUser) {
    return next(new AppError("Deleted user not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      deletedUser: updatedDeletedUser,
    },
  });
});

// Delete a DeletedUser record
exports.DeleteDeletedUser = catchAsync(async (req, res, next) => {
  const deletedUser = await DeletedUser.findById(req.params.id);

  if (!deletedUser) {
    return next(new AppError("Deleted user not found", 404));
  }

  await DeletedUser.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Deleted user successfully removed",
    data: null,
  });
});
