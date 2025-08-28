import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative", // Refers to your Cooperative model
      required: true, // Every fee entry must belong to a cooperative
    },
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

// ⭐ UPDATED: Add a pre-save hook to automatically update status
feesSchema.pre("save", function (next) {
  if (this.isModified("amountPaid") || this.isModified("amountOwed")) {
    const remaining = this.amountOwed - this.amountPaid;

    if (remaining <= 0) {
      this.status = "paid";
      this.paidAt = this.paidAt || new Date(); // Set paidAt if not already set
    } else if (this.amountPaid > 0 && remaining > 0) {
      this.status = "partial";
      this.paidAt = undefined; // Clear paidAt if it moves from paid to partial
    } else {
      this.status = "unpaid";
      this.paidAt = undefined; // Clear paidAt if it moves from partial/paid to unpaid
    }
  }
  next();
});

//   Index for seasonal fees now includes cooperativeId
feesSchema.index(
  { cooperativeId: 1, userId: 1, seasonId: 1, feeTypeId: 1 },
  { unique: true, partialFilterExpression: { seasonId: { $exists: true } } }
);

//  Index for non-seasonal fees now includes cooperativeId
feesSchema.index(
  { cooperativeId: 1, userId: 1, feeTypeId: 1 },
  { unique: true, partialFilterExpression: { seasonId: { $exists: false } } }
);

const Fees = mongoose.model("Fees", feesSchema);
export default Fees;
