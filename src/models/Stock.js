import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
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

  cash: {
    type: Number,
    required: true,
    min: [0, "Cash must be a non-negative number"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
