import mongoose from "mongoose";

const feeTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
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

const FeeType = mongoose.model("FeeType", feeTypeSchema);
export default FeeType;
