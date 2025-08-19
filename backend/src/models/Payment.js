import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative", // Assuming you have a Cooperative model
      required: true,
      index: true, // Add an index for faster queries
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // seasonId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Season",
    //   required: true,
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
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
