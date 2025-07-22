
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  names: {
    type: String,
    required: true,
    trim: false,
  },
  password: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["farmer", "accountant", "manager"],
    default: "farmer",
    required: true,
  },
  profilePicture: {
    type: String,
    default: "https://www.w3schools.com/howto/img_avatar.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
