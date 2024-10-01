const AppError = require("../../ErrorHandlers/appError");
const authUtils = require("../../Utils/authUtils");
const catchAsync = require("../../ErrorHandlers/catchAsync");
const User = require("../../User/models/usermodel");
const Admin = require("../../admin/models/adminModel");

exports.Login = catchAsync(async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;

  if ((!email && !phoneNumber) || !password) {
    return next(
      new AppError(
        "Email or phone number and password must be provided to log in.",
        401
      )
    );
  }

  let user = null;

  if (email) {
    user = await User.findOne({ email }).select("+password");
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber }).select("+password");
  }

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  const isPasswordCorrect = await user.correctPassword(password);

  if (isPasswordCorrect) {
    const token = await authUtils.signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
      user,
    });
  } else {
    return next(new AppError("Incorrect phone number or password.", 403));
  }
});

exports.LoginAdmin = catchAsync(async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;

  if ((!email && !phoneNumber) || !password) {
    return next(
      new AppError(
        "Email or phone number and password must be provided to log in.",
        401
      )
    );
  }

  let admin = null;

  if (email) {
    admin = await Admin.findOne({ email }).select("+password");
  } else if (phoneNumber) {
    admin = await Admin.findOne({ phoneNumber }).select("+password");
  }

  if (!admin) {
    return next(new AppError("Admin not found!", 404));
  }

  const isPasswordCorrect = await admin.correctPassword(password);

  if (isPasswordCorrect) {
    const token = await authUtils.signToken(admin._id); // Generate a token for the admin
    res.status(200).json({
      status: "success",
      token,
      admin, // Return the admin object (you can filter fields if needed)
    });
  } else {
    return next(new AppError("Incorrect phone number or password.", 403));
  }
});
