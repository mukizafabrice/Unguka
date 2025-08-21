import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
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
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    amountRemainingToPay: {
      type: Number,
      required: true,
    },
    transactionDate: { type: Date, default: Date.now },
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative", 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);
