import mongoose from "mongoose";

const puchaseInputSchema = new mongoose.Schema({
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
  paymantType: {
    type: String,
    enum: ["cash", "loan"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const PurchaseInput = mongoose.model("PurchaseInput", puchaseInputSchema);
export default PurchaseInput;
