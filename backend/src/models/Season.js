import mongoose from "mongoose";

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
// ⭐ UPDATED: Ensure uniqueness per cooperative, per name, per year
seasonSchema.index({ cooperativeId: 1, name: 1, year: 1 }, { unique: true });

export default mongoose.model("Season", seasonSchema);
