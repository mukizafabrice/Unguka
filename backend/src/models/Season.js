import mongoose from "mongoose";
import Fees from "./Fees.js";
import PurchaseInput from "./PurchaseInput.js";
import Loan from "./Loan.js";
import LoanTransaction from "./LoanTransaction.js";
import Production from "./Production.js";
import PurchaseOut from "./PurchaseOut.js";
const seasonSchema = new mongoose.Schema({
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative",
    required: true,
  },
  name: {
    type: String,
    required: true,
    enum: ["Season-A", "Season-B"],
  },
  year: {
    type: Number,
    required: true,
    min: [2000, "Year must be >= 2000"],
    max: [2100, "Year must be <= 2100"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
seasonSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const seasonId = doc._id;

  try {
    // Delete all documents from other collections where the userId field matches.
    await Promise.all([
      mongoose.model("PurchaseInput").deleteMany({ seasonId }),
      mongoose.model("Fees").deleteMany({ seasonId }),
      mongoose.model("Loan").deleteMany({ seasonId }),
      mongoose.model("LoanTransaction").deleteMany({ seasonId }),
      mongoose.model("Production").deleteMany({ seasonId }),
      mongoose.model("PurchaseOut").deleteMany({ seasonId }),
    ]);
  } catch (err) {
    console.error(`Error during cascading delete for user ${seasonId}:`, err);
  }
});

seasonSchema.index({ cooperativeId: 1, name: 1, year: 1 }, { unique: true });

export default mongoose.model("Season", seasonSchema);
