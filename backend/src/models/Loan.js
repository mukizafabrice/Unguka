import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  // The purchase this loan is associated with
  purchaseInputId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseInput",
    required: true,
  },

  // Renamed from 'totalPrice' to more accurately reflect the amount owed
  amountOwed: {
    type: Number,
    required: true,
    min: [0, "Amount owed must be a positive number"],
  },

  status: {
    type: String,
    enum: ["pending", "repaid"],
    required: true,
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
