import mongoose from "mongoose";
import { type } from "os";

const salesSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    trim: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    trim: true,
  },
  buyer: {
    type: String,
    required: true,
    trim: false,
  },
  paymentType: {
    type: Enum("cash", "loan"),
    required: true,
    status: {
      type: String,
      enum: ["paid", "unpaid"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
});
const Sales = mongoose.model("sales", salesSchema);
export default Sales;
