import PurchaseInput from "../models/PurchaseInput.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Loan from "../models/Loan.js";
import mongoose from "mongoose";

export const createPurchaseInput = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, paymentType } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid userId, productId, or seasonId" });
    }

    // Get product info
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ Calculate totalPrice automatically
    const totalPrice = product.unitPrice * quantity;

    // Create the purchase record
    const newPurchase = await PurchaseInput.create({
      userId,
      productId,
      seasonId,
      quantity,
      totalPrice,
      paymentType,
    });

    // Handle payment type
    if (paymentType === "cash") {
      const stock = await Stock.findOne();
      if (!stock) return res.status(404).json({ message: "Stock not found" });

      stock.cash += totalPrice;
      await stock.save();
    } else if (paymentType === "loan") {
      await Loan.create({
        userId,
        productId,
        seasonId,
        quantity,
        totalPrice,
        status: "pending",
      });
    }

    res
      .status(201)
      .json({ message: "Purchase created", purchase: newPurchase });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ ALL
export const getAllPurchaseInputs = async (req, res) => {
  try {
    const purchases = await PurchaseInput.find()
      .populate("userId", "name phoneNumber")
      .populate("productId", "name unitPrice")
      .populate("seasonId", "name year");

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ ONE
export const getPurchaseInputById = async (req, res) => {
  try {
    const purchase = await PurchaseInput.findById(req.params.id)
      .populate("userId", "name phoneNumber")
      .populate("productId", "name unitPrice")
      .populate("seasonId", "name");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// UPDATE
export const updatePurchaseInput = async (req, res) => {
  try {
    const updatedPurchase = await PurchaseInput.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("userId", "name phoneNumber")
      .populate("productId", "name unitPrice")
      .populate("seasonId", "name");

    if (!updatedPurchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    res
      .status(200)
      .json({ message: "Purchase updated", purchase: updatedPurchase });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE
export const deletePurchaseInput = async (req, res) => {
  try {
    const deleted = await PurchaseInput.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
