import mongoose from "mongoose";
import Fees from "./Fees.js";
import PurchaseInput from "./PurchaseInput.js";
import Loan from "./Loan.js";
import LoanTransaction from "./LoanTransaction.js";
import Payment from "./LoanTransaction.js";
import PaymentTransaction from "./PaymentTransaction.js";
import Plot from "./Plot.js";
import Production from "./Production.js";
import Cooperative from "./Cooperative.js";
import Announcements from "./Announcements.js";

const userSchema = new mongoose.Schema({
  names: {
    type: String,
    required: [true, "Names are required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must not exceed 50 characters"],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    // Updated regex to accept a more general international format
    match: [
      /^\+?[1-9]\d{7,14}$/,
      "Please enter a valid phone number (e.g., +250781234567 or 0781234567)",
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
    enum: ["member", "manager", "superadmin"],
    default: "member",
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
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cooperative",
    required: function () {
      return this.role === "member" || this.role === "manager";
    },
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A robust post-delete hook that only deletes data associated with the user's ID.
userSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const userId = doc._id;

  try {
    // Delete all documents from other collections where the userId field matches.
    await Promise.all([
      mongoose.model("PurchaseInput").deleteMany({ userId }),
      mongoose.model("Fees").deleteMany({ userId }),
      mongoose.model("Loan").deleteMany({ userId }),
      mongoose.model("LoanTransaction").deleteMany({ userId }),
      mongoose.model("Payment").deleteMany({ userId }),
      mongoose.model("PaymentTransaction").deleteMany({ userId }),
      mongoose.model("Plot").deleteMany({ userId }),
      mongoose.model("Production").deleteMany({ userId }),
      mongoose.model("Announcements").deleteMany({ userId }),
    ]);
  } catch (err) {
    console.error(`Error during cascading delete for user ${userId}:`, err);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
