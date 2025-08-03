import Loan from "../models/Loan.js";
import Stock from "../models/Stock.js";
import PurchaseInput from "../models/PurchaseInput.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/**
 * @desc Get all loans and populate purchase details
 * @route GET /api/loans
 */
export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate({
        path: "purchaseInputId",
        populate: [
          { path: "productId", select: "name unitPrice" }, // Changed 'productName' to 'name' to align with common schema naming
          { path: "userId", select: "names phoneNumber" },
          { path: "seasonId", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Loans fetched successfully",
      count: loans.length,
      loans,
    });
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({
      message: "Server error while fetching loans",
      error: error.message,
    });
  }
};

/**
 * @desc Mark a loan as repaid and update cash
 * @route PUT /api/loans/repay/:id
 */
export const markLoanAsRepaid = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid loan ID" });
    }

    // Find the loan
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status === "repaid") {
      return res.status(400).json({ message: "Loan already repaid" });
    }

    // Find the cash record
    let cash = await Cash.findOne();
    if (!cash) {
      // Create a cash record if one doesn't exist
      cash = new Cash({ amount: 0 });
    }

    // Update cash amount with the amount owed
    cash.amount += loan.amountOwed;
    await cash.save();

    // Update loan status to 'repaid'
    loan.status = "repaid";
    await loan.save();

    res.status(200).json({
      message: "Loan marked as repaid and cash updated",
      loan,
    });
  } catch (error) {
    console.error("Error marking loan as repaid:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all loans for a specific user by phone number
 * @route GET /api/loans/user/:phoneNumber
 */
export const getLoansByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Find the user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all purchases for this user
    const purchases = await PurchaseInput.find({ userId: user._id }).select(
      "_id"
    );

    const purchaseIds = purchases.map((p) => p._id);

    // Find all loans for these purchases and populate product details
    const loans = await Loan.find({
      purchaseInputId: { $in: purchaseIds },
    }).populate({
      path: "purchaseInputId",
      populate: { path: "productId", select: "name" },
    });

    res.status(200).json({ loans });
  } catch (error) {
    console.error("Error getting loans by phone number:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update a loan by ID
 * @route PUT /api/loans/:id
 */
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid } = req.body; // Expecting amountPaid instead of a generic update

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // You can't repay more than what's owed
    if (amountPaid > loan.amountOwed) {
      return res
        .status(400)
        .json({ message: "Amount paid exceeds amount owed" });
    }

    // Decrease the amount owed
    loan.amountOwed -= amountPaid;

    // If the full amount is paid, mark the loan as repaid
    if (loan.amountOwed === 0) {
      loan.status = "repaid";
    }

    // Save the updated loan
    await loan.save();

    // Update cash with the amount paid
    let cash = await Cash.findOne();
    if (!cash) {
      cash = new Cash({ amount: 0 });
    }
    cash.amount += amountPaid;
    await cash.save();

    res.status(200).json({ message: "Loan updated", loan });
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a loan by ID
 * @route DELETE /api/loans/:id
 */
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLoan = await Loan.findByIdAndDelete(id);
    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    console.warn(
      `Loan ${id} was deleted. Associated records may need manual adjustment.`
    );

    res.status(200).json({ message: "Loan deleted" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
