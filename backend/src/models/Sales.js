import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
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

  buyer: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^(07[2-8]\d{7}|\+2507[2-8]\d{7})$/,
      "Please enter a valid phone number",
    ],
  },

  paymentType: {
    type: String,
    enum: ["cash", "loan"],
    required: true,
  },

  status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sales = mongoose.model("Sales", salesSchema);
export default Sales;
