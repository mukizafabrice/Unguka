import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    purchaseInputId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseInput",
    },

    cooperativeId: {
      // New field for cooperative association
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative", // Reference to the Cooperative model
      required: true, // Assuming a loan must be associated with a cooperative
    },

    // Renamed from 'totalPrice' to more accurately reflect the amount owed
    amountOwed: {
      type: Number,
      required: true,
      min: [0, "Amount owed must be a positive number"],
    },
    interest: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "repaid"],
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
