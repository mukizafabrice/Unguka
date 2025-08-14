import mongoose from "mongoose";

const purchaseInputSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Season",
    required: true,
  },
  // ⭐ NEW: Add cooperativeId to link purchases to a specific cooperative
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative", // Refers to your Cooperative model
    required: true, // Assuming every purchase input must belong to a cooperative
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be an integer",
    },
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, "Unit price must be a positive number"],
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Total price must be a positive number"],
  },
  amountPaid: {
    type: Number,
    required: true,
    min: [0, "Amount paid must be a positive number"],
  },
  amountRemaining: {
    type: Number,
    required: true,
    min: [0, "Amount remaining must be a positive number"],
  },
  status: {
    type: String,
    enum: ["paid", "loan"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PurchaseInput = mongoose.model("PurchaseInput", purchaseInputSchema);
export default PurchaseInput;
