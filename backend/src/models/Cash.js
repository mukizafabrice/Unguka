import mongoose from "mongoose";

const cashSchema = new mongoose.Schema({
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative",
    required: true,
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
