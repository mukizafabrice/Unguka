import PurchaseInput from "../models/PurchaseInput.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js";
import Loan from "../models/Loan.js";
import mongoose from "mongoose";

export const createPurchaseInput = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, paymentType, amountPaid } = req.body;

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
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalPrice = product.unitPrice * quantity;
    
    // Ensure amountPaid is provided and doesn't exceed totalPrice
    if (amountPaid === undefined || amountPaid < 0) {
      return res.status(400).json({ message: "Invalid amountPaid" });
    }

    if (amountPaid > totalPrice) {
        return res.status(400).json({ message: "Amount paid cannot exceed total price" });
    }

    const amountRemaining = totalPrice - amountPaid;

    // Update stock quantity
    const stock = await Stock.findOne({ productId });
    if (!stock) {
      return res.status(404).json({ message: "Stock for product not found" });
    }

    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    stock.quantity -= quantity;
    await stock.save();

    // Update cash with the amount paid
    if (amountPaid > 0) {
      let cash = await Cash.findOne();
      if (!cash) {
        cash = new Cash({ amount: 0 });
      }
      cash.amount += amountPaid;
      await cash.save();
    }

    // Record purchase with amountPaid and amountRemaining
    const newPurchase = await PurchaseInput.create({
      userId,
      productId,
      seasonId,
      quantity,
      totalPrice,
      paymentType,
      amountPaid,
      amountRemaining,
    });

    // Create loan record if there's a remaining balance
    if (amountRemaining > 0) {
      await Loan.create({
        purchaseInputId: newPurchase._id,
        quantity: quantity,
        totalPrice: amountRemaining, // This should be the remaining amount, not the full totalPrice
        status: "pending",
      });
    }
    
    // Respond with success message and new purchase record
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
    const { quantity, amountPaid } = req.body;
    const { id } = req.params;

    const oldPurchase = await PurchaseInput.findById(id);
    if (!oldPurchase) {
      return res.status(404).json({ message: "Purchase input not found" });
    }

    const newQuantity = quantity !== undefined ? quantity : oldPurchase.quantity;
    const newAmountPaid = amountPaid !== undefined ? amountPaid : oldPurchase.amountPaid;

    const product = await Product.findById(oldPurchase.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newTotalPrice = product.unitPrice * newQuantity;
    const newAmountRemaining = newTotalPrice - newAmountPaid;

    // Validate the new amount paid
    if (newAmountPaid > newTotalPrice) {
      return res.status(400).json({ message: "Amount paid cannot exceed new total price" });
    }

    // Update stock quantity if quantity has changed
    const stock = await Stock.findOne({ productId: oldPurchase.productId });
    if (stock) {
      const quantityDifference = newQuantity - oldPurchase.quantity;
      stock.quantity -= quantityDifference;
      await stock.save();
    }

    // Update cash if amount paid has changed
    const amountPaidDifference = newAmountPaid - oldPurchase.amountPaid;
    if (amountPaidDifference !== 0) {
      let cash = await Cash.findOne();
      if (cash) {
        cash.amount += amountPaidDifference;
        await cash.save();
      }
    }

    // Update the purchase record
    const updatedPurchase = await PurchaseInput.findByIdAndUpdate(
      id,
      {
        quantity: newQuantity,
        totalPrice: newTotalPrice,
        amountPaid: newAmountPaid,
        amountRemaining: newAmountRemaining,
        // The other fields can also be updated if needed
      },
      { new: true }
    )
      .populate("userId", "name phoneNumber")
      .populate("productId", "name unitPrice")
      .populate("seasonId", "name");

    // Update the corresponding loan record or create/delete it
    let loan = await Loan.findOne({ purchaseInputId: oldPurchase._id });

    if (newAmountRemaining > 0) {
      if (loan) {
        // Update existing loan
        loan.totalPrice = newAmountRemaining;
        await loan.save();
      } else {
        // Create new loan
        await Loan.create({
          purchaseInputId: updatedPurchase._id,
          quantity: newQuantity,
          totalPrice: newAmountRemaining,
          status: "pending",
        });
      }
    } else if (loan) {
      // Amount remaining is 0, delete the loan
      await Loan.findByIdAndDelete(loan._id);
    }

    res.status(200).json({ message: "Purchase updated", purchase: updatedPurchase });
  } catch (error) {
    console.error("Error updating purchase input:", error);
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
      await stock.save();
    }

    // Adjust cash by the amount paid for this purchase
    if (purchase.amountPaid > 0) {
      let cash = await Cash.findOne();
      if (cash) {
        cash.amount -= purchase.amountPaid;
        await cash.save();
      }
    }

    // Delete related loan if one exists
    await Loan.findOneAndDelete({ purchaseInputId: purchase._id });

    // Delete the purchase record
    await PurchaseInput.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Purchase deleted and stock adjusted" });
  } catch (error) {
    console.error("Error deleting purchase input:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};