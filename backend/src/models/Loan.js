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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
    },

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
