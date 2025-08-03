import PurchaseInput from "../models/PurchaseInput.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js";
import Loan from "../models/Loan.js";
import mongoose from "mongoose";

export const createPurchaseInput = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, unitPrice, amountPaid } =
      req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid userId, productId, or seasonId" });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalPrice = unitPrice * quantity;

    if (amountPaid === undefined || amountPaid < 0) {
      return res.status(400).json({ message: "Invalid amountPaid" });
    }
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

    const newPurchase = await PurchaseInput.create({
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      totalPrice,
      status,
      amountPaid,
      amountRemaining,
    });

    if (amountRemaining > 0) {
      await Loan.create({
        purchaseInputId: newPurchase._id,
        amountOwed: amountRemaining,
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
    const purchase = await PurchaseInput.findById(req.params.id)
      .populate("userId", "name phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    res.status(200).json(purchase);
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

    // Use values from req.body or fallback to oldPurchase data
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

    // --- Stock Update Logic ---
    const quantityDifference = newQuantity - oldPurchase.quantity;
    if (quantityDifference !== 0) {
      const stock = await Stock.findOne({ productId: oldPurchase.productId });
      if (stock) {
        stock.quantity -= quantityDifference;
        await stock.save();
      } else {
        console.error(`Stock for product ${oldPurchase.productId} not found.`);
      }
    }

    // --- Cash Update Logic ---
    const amountPaidDifference = newAmountPaid - oldPurchase.amountPaid;
    if (amountPaidDifference !== 0) {
      let cash = await Cash.findOne();
      if (cash) {
        cash.amount += amountPaidDifference;
        await cash.save();
      } else {
        console.error("Cash document not found.");
      }
    }

    const newStatus = newAmountRemaining > 0 ? "loan" : "paid";

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
        amountRemaining: newAmountRemaining,
        status: newStatus,
      },
      { new: true }
    )
      .populate("userId", "names phoneNumber")
      .populate("productId", "name")
      .populate("seasonId", "year name");

    // --- Loan Update Logic ---
    let loan = await Loan.findOne({ purchaseInputId: oldPurchase._id });

    if (newAmountRemaining > 0) {
      if (loan) {
        // Fix: Use 'amountOwed' instead of 'totalPrice' to match the Loan model
        loan.amountOwed = newAmountRemaining;
        await loan.save();
      } else {
        // Fix: Use 'amountOwed' instead of 'totalPrice' to match the Loan model
        await Loan.create({
          purchaseInputId: updatedPurchase._id,
          userId: updatedPurchase.userId,
          quantity: newQuantity,
          amountOwed: newAmountRemaining,
          status: "pending",
        });
      }
    } else if (loan) {
      await Loan.findByIdAndDelete(loan._id);
    }

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
