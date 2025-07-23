import mongoose from "mongoose";

const purchaseInputSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Season",
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

  paymentType: {
    type: String,
    enum: ["cash", "loan"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PurchaseInput = mongoose.model("PurchaseInput", purchaseInputSchema);
export default PurchaseInput;
