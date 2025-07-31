import mongoose from "mongoose";

const purchaseOutSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product Id is required"],
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Season",
    required: [true, "Season Id is required"],
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PurchaseOut = mongoose.model("Purchase", purchaseOutSchema);

export default PurchaseOut;
