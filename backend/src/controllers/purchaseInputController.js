import PurchaseInput from "../models/PurchaseInput.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js";
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

    const totalPrice = product.unitPrice * quantity;

    // Update stock quantity
    const stock = await Stock.findOne({ productId });
    if (!stock)
      return res.status(404).json({ message: "Stock for product not found" });

    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    stock.quantity -= quantity;
    await stock.save();

    // Update cash if paid in cash
    if (paymentType === "cash") {
      let cash = await Cash.findOne();
      if (!cash) {
        cash = new Cash({ amount: 0 });
      }
      cash.amount += totalPrice;
      await cash.save();
    }

    // Record purchase
    const newPurchase = await PurchaseInput.create({
      userId,
      productId,
      seasonId,
      quantity,
      totalPrice,
      paymentType,
    });

    // Create loan record if payment is by loan
    if (paymentType === "loan") {
      await Loan.create({
        purchaseInputId: newPurchase._id,
        quantity,
        totalPrice,
        status: "pending",
      });
    }

    res.status(201).json({
      message: "Purchase recorded successfully",
      purchase: newPurchase,
    });
  } catch (error) {
    console.error("Error creating purchase input:", error);
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
    const purchase = await PurchaseInput.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    // Restore stock quantity
    const stock = await Stock.findOne({ productId: purchase.productId });
    if (stock) {
      stock.quantity += purchase.quantity;

      if (purchase.paymentType === "cash") {
        stock.cash -= purchase.totalPrice;
      }

      await stock.save();
    }

    // Delete related loan if payment was on loan
    if (purchase.paymentType === "loan") {
      await Loan.findOneAndDelete({ purchaseInputId: purchase._id });
    }

    // Delete the purchase
    await PurchaseInput.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Purchase deleted and stock adjusted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
