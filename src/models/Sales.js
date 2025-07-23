import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
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

  buyer: {
    type: String,
    required: true,
    trim: true,
  },

  paymentType: {
    type: String,
    enum: ["cash", "loan"],
    required: true,
  },

  status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid", // Optional: defaults for loan
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sales = mongoose.model("Sales", salesSchema);
export default Sales;
