import mongoose from "mongoose";
import Production from "./Production.js";
import PurchaseInput from "./PurchaseInput.js";
import PurchaseOut from "./PurchaseOut.js";
import Stock from "./Stock.js";
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Product name must be at least 2 characters"],
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
productSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const productId = doc._id;

  try {
    // Delete all documents from other collections where the userId field matches.
    await Promise.all([mongoose.model("Production").deleteMany({ productId })]);
    await Promise.all([
      mongoose.model("PurchaseOut").deleteMany({ productId }),
    ]);
    await Promise.all([
      mongoose.model("PurchaseInput").deleteMany({ productId }),
    ]);
    await Promise.all([mongoose.model("Stock").deleteMany({ productId })]);
  } catch (err) {
    console.error(`Error during cascading delete for user ${productId}:`, err);
  }
});
productSchema.index({ productName: 1, cooperativeId: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
