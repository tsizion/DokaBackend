const jwt = require("jsonwebtoken");
const AppError = require("../ErrorHandlers/appError");
const User = require("../User/models/usermodel");
const Admin = require("../admin/models/adminModel");

// Middleware to protect routes for user authentication
exports.protectUser = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting user id from the token payload
    const userId = decoded.id;

    // Find the user using the retrieved id
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // Attach the user to the request object for use in subsequent middleware or route handlers
    req.user = user;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};

// Middleware to protect routes for admin authentication
exports.protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Checking the Authorization header for the token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(
        new AppError(
          "Not authorized. Please log in to access this resource.",
          401
        )
      );
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extracting admin id from the token payload
    const adminId = decoded.id;

    // Find the admin using the retrieved id
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return next(new AppError("Admin not found.", 404));
    }

    // Check if the user has the 'Admin' role
    if (admin.role !== "Admin" && admin.role !== "Super Admin") {
      return next(new AppError("User does not have admin rights.", 403));
    }

    // Attach the admin to the request object for use in subsequent middleware or route handlers
    req.admin = admin;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Not authorized. Please log in to access this resource.",
        401
      )
    );
  }
};
