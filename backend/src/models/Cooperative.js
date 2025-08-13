import mongoose from "mongoose";
import Fees from "./Fees.js";
import PurchaseInput from "./PurchaseInput.js";
import Loan from "./Loan.js";
import LoanTransaction from "./LoanTransaction.js";
import Payment from "./Payment.js";
import PaymentTransaction from "./PaymentTransaction.js";
import Plot from "./Plot.js";
import Production from "./Production.js";
import User from "./User.js";
import Product from "./Product.js";
import PurchaseOut from "./PurchaseOut.js";
import Sales from "./Sales.js";
import Season from "./Season.js";
import Stock from "./Stock.js";
import FeeType from "./FeeType.js";

const cooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Cooperative name is required"],
    unique: true,
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must not exceed 50 characters"],
  },
  registrationNumber: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Registration number is required"],
    match: [
      /^CF\d{5}$/,
      "Registration number must start with 'CF' followed by 5 digits",
    ],
  },
  district: {
    type: String,
    required: [true, "District is required"],
    trim: true,
    maxlength: [50, "District name must not exceed 50 characters"],
  },
  sector: {
    type: String,
    required: [true, "Sector is required"],
    trim: true,
    maxlength: [50, "Sector name must not exceed 50 characters"],
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  contactPhone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    // Updated regex to accept a more general international format
    match: [
      /^\+?[1-9]\d{7,14}$/,
      "Please enter a valid phone number (e.g., +250781234567 or 0781234567)",
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A robust post-delete hook that works with modern Mongoose methods.
cooperativeSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const coopId = doc._id;

  try {
    // Delete all documents from other collections where the cooperativeId field matches.
    await Promise.all([
      mongoose.model("User").deleteMany({ cooperativeId: coopId }),
      mongoose.model("PurchaseInput").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Fees").deleteMany({ cooperativeId: coopId }),
      mongoose.model("FeeType").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Loan").deleteMany({ cooperativeId: coopId }),
      mongoose.model("LoanTransaction").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Product").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Payment").deleteMany({ cooperativeId: coopId }),
      mongoose
        .model("PaymentTransaction")
        .deleteMany({ cooperativeId: coopId }),
      mongoose.model("Plot").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Production").deleteMany({ cooperativeId: coopId }),
      mongoose.model("PurchaseOut").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Sales").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Season").deleteMany({ cooperativeId: coopId }),
      mongoose.model("Stock").deleteMany({ cooperativeId: coopId }),
    ]);
  } catch (err) {
    console.error(
      `Error during cascading delete for cooperative ${coopId}:`,
      err
    );
  }
});

const Cooperative = mongoose.model("Cooperative", cooperativeSchema);
export default Cooperative;
