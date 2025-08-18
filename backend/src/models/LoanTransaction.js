import mongoose from "mongoose";

const loanTransactionSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true,
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative",
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
    min: [0, "Amount paid must be a positive number"],
  },
  amountRemainingToPay: {
    type: Number,
    required: true,
    min: [0, "Amount remaining to pay must be a positive number"],
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LoanTransaction = mongoose.model(
  "LoanTransaction",
  loanTransactionSchema
);
export default LoanTransaction;
