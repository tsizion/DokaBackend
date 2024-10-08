const mongoose = require("mongoose");

const DeletedUserSchema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: [String], // Array of addresses
      default: [],
    },
    // Custom deletion reason provided by user or admin
    deletionReason: {
      type: String,
      default: "User-initiated or admin deletion",
    },
    // Date when the user was deleted
    deletedAt: {
      type: Date,
      default: Date.now,
    },
    // Admin who deleted the user
    deletedByAdmin: {
      type: Boolean,
      default: false,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: function () {
        return this.deletedByAdmin;
      },
    },
    adminName: {
      type: String,
      required: function () {
        return this.deletedByAdmin;
      },
    },
  },
  { timestamps: true }
);

const DeletedUser = mongoose.model("DeletedUser", DeletedUserSchema);

module.exports = DeletedUser;
