import mongoose from "mongoose";
import PurchaseInput from "../models/PurchaseInput.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js";
import Loan from "../models/Loan.js";

import LoanTransaction from "../models/LoanTransaction.js";

export const createPurchaseInput = async (req, res) => {
  try {
    const {
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      amountPaid,
      interest,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid userId, productId, or seasonId" });
    }
    if (quantity <= 0 || unitPrice <= 0 || amountPaid < 0) {
      return res.status(400).json({
        message:
          "Quantity and Unit Price must be positive, and amount paid cannot be negative.",
      });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalPrice = unitPrice * quantity;
    if (amountPaid > totalPrice) {
      return res
        .status(400)
        .json({ message: "Amount paid cannot exceed total price" });
    }

    const amountRemaining = totalPrice - amountPaid;

    const stock = await Stock.findOne({ productId });
    if (!stock) {
      return res.status(404).json({ message: "Stock for product not found" });
    }
    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }
    stock.quantity -= quantity;
    await stock.save();

    if (amountPaid > 0) {
      let cash = await Cash.findOne();
      if (!cash) {
        cash = new Cash({ amount: 0 });
      }
      cash.amount += amountPaid;
      await cash.save();
    }

    const status = amountRemaining > 0 ? "loan" : "paid";
    let finalAmountRemaining = amountRemaining;

    // Declare loanRevenue here and initialize it
    let loanRevenue = 0;

    if (amountRemaining > 0) {
      const loanInterestRate = interest / 100;
      loanRevenue = amountRemaining * loanInterestRate;
      finalAmountRemaining = amountRemaining + loanRevenue;
    }

    const newPurchase = await PurchaseInput.create({
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      totalPrice,
      status,
      amountPaid,
      amountRemaining: finalAmountRemaining,
    });

    if (finalAmountRemaining > 0) {
      await Loan.create({
        purchaseInputId: newPurchase._id,
        userId,
        quantity,
        amountOwed: finalAmountRemaining,
        loanRevenue: loanRevenue, // Now loanRevenue is always defined
        interest,
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

export const getAllPurchaseInputs = async (req, res) => {
  try {
    const purchases = await PurchaseInput.find()
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year");

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPurchaseInputById = async (req, res) => {
  try {
    const userId = req.params.id;

    const purchases = await PurchaseInput.find({ userId })
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 });

    if (!purchases || purchases.length === 0) {
      return res
        .status(404)
        .json({ message: "No purchase inputs found for this user" });
    }

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePurchaseInput = async (req, res) => {
  try {
    const { quantity, unitPrice, amountPaid, userId, productId, seasonId } =
      req.body;
    const { id } = req.params;

    const oldPurchase = await PurchaseInput.findById(id);
    if (!oldPurchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    const newQuantity =
      quantity !== undefined ? quantity : oldPurchase.quantity;
    const newUnitPrice =
      unitPrice !== undefined ? unitPrice : oldPurchase.unitPrice;
    const newAmountPaid =
      amountPaid !== undefined ? amountPaid : oldPurchase.amountPaid;

    const newTotalPrice = newUnitPrice * newQuantity;
    const newAmountRemaining = newTotalPrice - newAmountPaid;

    if (newAmountPaid > newTotalPrice) {
      return res
        .status(400)
        .json({ message: "Amount paid cannot exceed new total price" });
    }

    let cashChange = 0;
    let stockChange = 0;

    const quantityDifference = newQuantity - oldPurchase.quantity;
    if (quantityDifference !== 0) {
      stockChange = quantityDifference;
    }

    const amountPaidDifference = newAmountPaid - oldPurchase.amountPaid;
    if (amountPaidDifference !== 0) {
      cashChange += amountPaidDifference;
    }

    let finalAmountRemaining = newAmountRemaining;
    let loanRevenue = 0;

    if (newAmountRemaining > 0) {
      const loanInterestRate = 0.05;
      loanRevenue = newAmountRemaining * loanInterestRate;
      finalAmountRemaining = newAmountRemaining + loanRevenue;

      let loan = await Loan.findOne({ purchaseInputId: oldPurchase._id });

      if (loan) {
        loan.amountOwed = finalAmountRemaining;
        loan.loanRevenue = loanRevenue;
        await loan.save();
      } else {
        await Loan.create({
          purchaseInputId: oldPurchase._id,
          userId: oldPurchase.userId,
          quantity: newQuantity,
          amountOwed: finalAmountRemaining,
          loanRevenue: loanRevenue,
          status: "pending",
        });
      }
    } else {
      await Loan.findOneAndDelete({ purchaseInputId: oldPurchase._id });
    }

    const stock = await Stock.findOne({ productId: oldPurchase.productId });
    if (stock) {
      stock.quantity -= stockChange;
      await stock.save();
    } else {
      console.error(`Stock for product ${oldPurchase.productId} not found.`);
    }

    const cash = await Cash.findOne();
    if (cash) {
      cash.amount += cashChange;
      await cash.save();
    } else {
      console.error("Cash document not found.");
    }

    const newStatus = finalAmountRemaining > 0 ? "loan" : "paid";

    const updatedPurchase = await PurchaseInput.findByIdAndUpdate(
      id,
      {
        userId: userId !== undefined ? userId : oldPurchase.userId,
        productId: productId !== undefined ? productId : oldPurchase.productId,
        seasonId: seasonId !== undefined ? seasonId : oldPurchase.seasonId,
        quantity: newQuantity,
        unitPrice: newUnitPrice,
        totalPrice: newTotalPrice,
        amountPaid: newAmountPaid,
        amountRemaining: finalAmountRemaining,
        status: newStatus,
      },
      { new: true }
    )
      .populate("userId", "names phoneNumber")
      .populate("productId", "name")
      .populate("seasonId", "year name");

    res
      .status(200)
      .json({ message: "Purchase updated", purchase: updatedPurchase });
  } catch (error) {
    console.error("Error updating purchase input:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePurchaseInput = async (req, res) => {
  try {
    const purchase = await PurchaseInput.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    const stock = await Stock.findOne({ productId: purchase.productId });
    if (stock) {
      stock.quantity += purchase.quantity;
      await stock.save();
    }

    if (purchase.amountPaid > 0) {
      let cash = await Cash.findOne();
      if (cash) {
        cash.amount -= purchase.amountPaid;
        await cash.save();
      }
    }

    await Loan.findOneAndDelete({ purchaseInputId: purchase._id });

    await PurchaseInput.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Purchase deleted and stock adjusted" });
  } catch (error) {
    console.error("Error deleting purchase input:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
