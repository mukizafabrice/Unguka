import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  names: {
    type: String,
    required: [true, "Names are required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must not exceed 50 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
    // Note: Hash before save in your controller or use pre-save hook.
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    match: [
      /^(07[2-8]\d{7}|\+2507[2-8]\d{7})$/,
      "Please enter a valid phone number",
    ],
  },
  nationalId: {
    type: Number,
    required: [true, "National ID is required"],
    unique: true,
    match: [/^\d{16}$/, "National ID must be exactly 16 digits"],
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
    validate: {
      validator: function (value) {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
      },
      message:
        "Profile picture must be a valid image URL (jpg, png, gif, etc).",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
