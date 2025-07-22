import mongoose from "mongoose";

const announcementsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: false,
  },
  Description: {
    type: String,
    required: true,
    trim: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Announcements = mongoose.model("Announcements", announcementsSchema);
export default Announcements;
