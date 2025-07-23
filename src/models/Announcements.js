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
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"],
    maxlength: [100, "Title must not exceed 100 characters"],
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Announcements = mongoose.model("Announcements", announcementsSchema);
export default Announcements;
