import PurchaseOut from "../models/PurchaseOut.js";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import Season from "../models/Season.js";
import mongoose from "mongoose";

// Create a new purchase-out record
export const createPurchaseOut = async (req, res) => {
  const { productId, seasonId, quantity, unitPrice } = req.body;
  const { cooperativeId } = req.user; // Retrieved from token

  try {
    const totalPrice = Number(quantity) * Number(unitPrice);

    // 1. Verify product
    const product = await Product.findOne({ _id: productId, cooperativeId });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // 2. Verify season
    const season = await Season.findOne({ _id: seasonId, cooperativeId });
    if (!season) {
      return res
        .status(404)
        .json({ success: false, message: "Season not found." });
    }

    // 3. Verify and update stock
    let stock = await Stock.findOne({ productId, cooperativeId });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for this purchase-out.",
      });
    }

    stock.quantity -= quantity;
    stock.totalPrice -= totalPrice;
    await stock.save();

    // 4. Create and save purchase-out record
    const newPurchaseOut = new PurchaseOut({
      productId,
      seasonId,
      cooperativeId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice,
    });

    await newPurchaseOut.save();

    res.status(201).json({
      success: true,
      message: "Purchase-out record created and stock adjusted successfully",
      data: newPurchaseOut,
    });
  } catch (error) {
    console.error("Error creating purchase-out record:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all purchase-out records
export const getAllPurchaseOut = async (req, res) => {
  try {
    const { cooperativeId } = req.user;
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cooperative ID format." });
    }

    const purchases = await PurchaseOut.find({ cooperativeId })
      .populate("productId", "productName")
      .populate("seasonId", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: purchases,
      message: "Purchase-out records fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching all purchase-out records:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a single purchase-out record by ID
export const getPurchaseOutById = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.user;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const purchase = await PurchaseOut.findOne({ _id: id, cooperativeId })
      .populate("productId", "productName")
      .populate("seasonId", "year name")
      .populate("cooperativeId", "name");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase-out record not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      data: purchase,
      message: "Purchase-out record fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching purchase-out record by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a purchase-out record
export const updatePurchaseOut = async (req, res) => {
  const { id } = req.params;
  const { quantity, unitPrice } = req.body;
  const { cooperativeId } = req.user;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(cooperativeId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }

  try {
    const oldPurchase = await PurchaseOut.findOne({ _id: id, cooperativeId });
    if (!oldPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase-out record not found or unauthorized.",
      });
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price must be a positive number.",
      });
    }

    const oldTotal = oldPurchase.totalPrice;
    const newTotal = parsedQuantity * parsedUnitPrice;
    const quantityDifference = parsedQuantity - oldPurchase.quantity;
    const totalPriceDifference = newTotal - oldTotal;

    const stock = await Stock.findOne({
      productId: oldPurchase.productId,
      cooperativeId,
    });
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Associated stock record not found.",
      });
    }

    if (stock.quantity < quantityDifference && quantityDifference > 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock to cover the quantity difference.",
      });
    }

    stock.quantity -= quantityDifference;
    stock.totalPrice -= totalPriceDifference;
    await stock.save();

    const updatedPurchase = await PurchaseOut.findOneAndUpdate(
      { _id: id, cooperativeId },
      {
        quantity: parsedQuantity,
        unitPrice: parsedUnitPrice,
        totalPrice: newTotal,
      },
      { new: true, runValidators: true }
    )
      .populate("productId", "productName")
      .populate("seasonId", "year name")
      .populate("cooperativeId", "name");

    if (!updatedPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase-out record not found or failed to update.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Purchase-out updated successfully with stock adjusted",
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase-out record:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a purchase-out record
export const deletePurchaseOut = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.user;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(cooperativeId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format." });
  }

  try {
    const purchase = await PurchaseOut.findOne({ _id: id, cooperativeId });
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase-out record not found or unauthorized.",
      });
    }

    // 1. Adjust stock: return quantity and total price back
    const stock = await Stock.findOne({
      productId: purchase.productId,
      cooperativeId,
    });
    if (stock) {
      stock.quantity += purchase.quantity;
      stock.totalPrice += purchase.totalPrice;
      await stock.save();
    } else {
      console.warn(
        `Stock for product ${purchase.productId} in cooperative ${cooperativeId} not found.`
      );
    }

    // 2. Delete purchase-out record
    await PurchaseOut.findOneAndDelete({ _id: id, cooperativeId });

    res.status(200).json({
      success: true,
      message: "Purchase-out deleted and stock adjusted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase-out record:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
