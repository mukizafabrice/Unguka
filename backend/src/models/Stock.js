import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  // ⭐ NEW: Add cooperativeId to link stock to a specific cooperative
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative", // Refers to your Cooperative model
    required: true, // Assuming every stock entry must belong to a cooperative
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

  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Total price must be a positive number"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
