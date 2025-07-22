import mongoose from "mongoose";
import { type } from "os";

const feesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["paid", "unpaid"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contribution = mongoose.model("Contribution", contributionSchema);
export default Fees;
