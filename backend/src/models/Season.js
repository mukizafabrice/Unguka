import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema({
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

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Season = mongoose.model("Season", seasonSchema);
export default Season;
