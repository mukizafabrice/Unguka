import mongoose from "mongoose";

const purchaseOutSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"],
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Season",
    required: [true, "Season ID is required"],
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: [true, "Cooperative ID is required"],
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

// The index has been removed as per your request.
// purchaseOutSchema.index({ productId: 1, seasonId: 1, cooperativeId: 1 });

const PurchaseOut = mongoose.model("PurchaseOut", purchaseOutSchema);

export default PurchaseOut;
