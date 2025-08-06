import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
    },
    feeTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeType",
      required: true,
    },
    amountOwed: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
    paidAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  // Add a toJSON transform to include virtuals when converting to JSON
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a virtual property 'remainingAmount'
// This field is not stored in the database, but is calculated on the fly
feesSchema.virtual("remainingAmount").get(function () {
  return this.amountOwed - this.amountPaid;
});

// Ensure one fee per user per season per feeType
feesSchema.index({ userId: 1, seasonId: 1, feeTypeId: 1 }, { unique: true });

const Fees = mongoose.model("Fees", feesSchema);
export default Fees;
