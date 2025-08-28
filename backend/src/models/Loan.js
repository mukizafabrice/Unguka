import mongoose from "mongoose";
import LoanTransaction from "./LoanTransaction.js";
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
    loanOwed: {
      type: Number,
      min: [0, "Amount owed must be a positive number"],
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

loanSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const loanId = doc._id;

  try {
    // Delete all documents from other collections where the userId field matches.
    await Promise.all([
      mongoose.model("LoanTransaction").deleteMany({ loanId }),
    ]);
  } catch (err) {
    console.error(`Error during cascading delete for user ${userId}:`, err);
  }
});
const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
