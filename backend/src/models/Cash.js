import mongoose from "mongoose";

const cashSchema = new mongoose.Schema({
  // ⭐ NEW: Add cooperativeId to link cash entries to a specific cooperative
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative", // Refers to your Cooperative model
    required: true, // Assuming every cash entry must belong to a cooperative
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a non-negative number"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cash = mongoose.model("Cash", cashSchema);
export default Cash;
