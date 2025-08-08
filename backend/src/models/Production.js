import mongoose from "mongoose";

const productionSchema = new mongoose.Schema(
  {
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

    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price must be a positive number"],
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price must be a positive number"],
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true } // ✅ Automatically adds createdAt & updatedAt
);

const Production = mongoose.model("Production", productionSchema);
export default Production;
