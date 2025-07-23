import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: [2, "Product name must be at least 2 characters"],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, "Unit price must be a positive number"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
