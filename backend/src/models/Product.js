import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    // Removed 'unique: true' from here, as uniqueness is now compound with cooperativeId
    required: true,
    trim: true,
    minlength: [2, "Product name must be at least 2 characters"],
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative", // Refers to your Cooperative model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ productName: 1, cooperativeId: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
