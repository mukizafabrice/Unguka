import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: [2, "Product name must be at least 2 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
