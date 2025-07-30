import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  purchaseInputId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseInput",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be an integer",
    },
  },

  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Total price must be a positive number"],
  },

  status: {
    type: String,
    enum: ["pending", "repaid"],
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
