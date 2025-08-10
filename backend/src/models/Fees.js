import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season" }, // optional
    feeTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeType",
      required: true,
    },
    amountOwed: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

feesSchema.virtual("remainingAmount").get(function () {
  return this.amountOwed - this.amountPaid;
});

// Index for seasonal fees
feesSchema.index(
  { userId: 1, seasonId: 1, feeTypeId: 1 },
  { unique: true, partialFilterExpression: { seasonId: { $exists: true } } }
);

// Index for non-seasonal fees
feesSchema.index(
  { userId: 1, feeTypeId: 1 },
  { unique: true, partialFilterExpression: { seasonId: { $exists: false } } }
);

const Fees = mongoose.model("Fees", feesSchema);
export default Fees;
