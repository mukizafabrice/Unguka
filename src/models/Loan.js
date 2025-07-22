import mongoose from "mongoose";
import { type } from "os";

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    trim: true,
  },

  totalPrice: {
    type: Number,
    required: true,
    trim: true,
  },
  status: {
    type: Enum("pending", "repaid"),
    required: true,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
