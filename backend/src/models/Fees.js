import mongoose from "mongoose";

const feesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Season",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a positive number"],
  },

  status: {
    type: String,
    enum: ["paid", "unpaid"],
    defualt: "unpaid",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Fees = mongoose.model("Fees", feesSchema);
export default Fees;
