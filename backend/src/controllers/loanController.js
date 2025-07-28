import Loan from "../models/Loan.js";
import Stock from "../models/Stock.js";
import PurchaseInput from "../models/PurchaseInput.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate({
        path: "purchaseInputId",
        populate: [
          { path: "productId", select: "productName unitPrice" },
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

export const markLoanAsRepaid = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate loan ID
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

    // Find the stock record
    const stock = await Stock.findOne();
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Update stock cash
    stock.cash += loan.totalPrice;
    await stock.save();

    // Update loan status
    loan.status = "repaid";
    await loan.save();

    res.status(200).json({
      message: "Loan marked as repaid and stock cash updated",
      loan,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLoansByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Find the user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all purchases for this user
    const purchases = await PurchaseInput.find({ userId: user._id }).select(
      "_id"
    );

    const purchaseIds = purchases.map((p) => p._id);

    // Find all loans for these purchases
    const loans = await Loan.find({
      purchaseInputId: { $in: purchaseIds },
    }).populate({
      path: "purchaseInputId",
      populate: { path: "productId", select: "name" },
    });

    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//update loan by id
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedLoan = await Loan.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan updated", loan: updatedLoan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//delete loan by id
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLoan = await Loan.findByIdAndDelete(id);
    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
