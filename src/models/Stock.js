import mongoose from "mongoose";
import { type } from "os";

const stockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    trim: true,
    required: true,
  },
  totalPrice: {
    type: Number,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
