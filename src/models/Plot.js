import mongoose from "mongoose";

const plotSchema = new mongoose.Schema({
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
  area: {
    type: Number,
    required: true,
    trim: true,
  },
  upi: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Plot = mongoose.model("Plot", plotSchema);
export default Plot;
