const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./Config/DB");
const globalErrorHandler = require("./ErrorHandlers/errorController");
const AppError = require("./ErrorHandlers/appError");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());
app.use(bodyParser.json());

connectDB();

app.use("/api/v1/user", require("./User/routers/userRouter"));
app.use("/api/v1/category", require("./Product/routers/categoryRouters"));
app.use("/api/v1/product", require("./Product/routers/productRouter"));
app.use("/api/v1/order", require("./order/routers/orderRouter"));
app.use("/api/v1/cart", require("./order/routers/cartRouter"));
app.use("/api/v1/delivery", require("./order/routers/deliveryRouter.js"));
app.use("/api/v1/admin", require("./admin/routers/adminRouter.js"));
app.use("/api/v1/login", require("./Login/Router/Login.js"));
app.use("/api/v1/deletedUser", require("./User/routers/deletedUserRouter"));

// Default route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Error handling for unmatched routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Error handling for unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.name, err.message);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});

// Error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.name, err.message);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});
