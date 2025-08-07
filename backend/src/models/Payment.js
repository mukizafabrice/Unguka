import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // seasonId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Season",
  //   required: true,
  // },
  grossAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalDeductions: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  amountDue: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  amountRemainingToPay: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ["paid", "partial", "pending"],
    required: true,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
