import mongoose from "mongoose";

const plotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // ⭐ REMOVED: productId - This is no longer directly on the Plot model
  // productId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Product",
  //   required: true,
  // },

  // ⭐ NEW: Add cooperativeId to link plots to a specific cooperative
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative", // Refers to your Cooperative model
    required: true, // Assuming every plot must belong to a cooperative
  },

  // ⭐ CHANGED: Renamed 'area' to 'size'
  size: {
    type: Number,
    required: true,
    min: [0.01, "Size must be at least 0.01"],
  },

  upi: {
    type: String,
    required: true,
    unique: true, // UPI remains unique across the entire system
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
