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
    min: [0.01, "Area must be at least 0.01"],
  },

  upi: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [5, "UPI must be at least 5 characters"],
    maxlength: [20, "UPI must not exceed 20 characters"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Plot = mongoose.model("Plot", plotSchema);
export default Plot;
