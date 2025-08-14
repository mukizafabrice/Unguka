import mongoose from "mongoose";

const feeTypeSchema = new mongoose.Schema(
  {
    // ⭐ NEW: Add cooperativeId to link fee types to a specific cooperative
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative", // Refers to your Cooperative model
      required: true, // Assuming every fee type must belong to a cooperative
    },
    name: {
      type: String,
      // Removed 'unique: true' from here, as uniqueness is now compound with cooperativeId
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isPerSeason: { type: Boolean, default: true }, // true = fee tied to a season
    autoApplyOnCreate: { type: Boolean, default: true }, // if non-seasonal, auto-assign immediately
  },
  { timestamps: true }
);

// ⭐ UPDATED: Define a compound unique index on name and cooperativeId.
// This ensures that the combination of name and cooperativeId must be unique.
// So, 'Membership Fee' can exist in CoopA and CoopB, but only once in CoopA.
feeTypeSchema.index({ name: 1, cooperativeId: 1 }, { unique: true });

const FeeType = mongoose.model("FeeType", feeTypeSchema);
export default FeeType;
