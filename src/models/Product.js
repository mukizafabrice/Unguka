import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
const Product = mongoose.model("Product", productSchema);
export default Product;
