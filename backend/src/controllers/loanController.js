import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";
import Cash from "../models/Cash.js";

export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: [
          { path: "userId", select: "names" },
          { path: "productId", select: "productName" },
          { path: "seasonId", select: "name year" },
        ],
      });

    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: { path: "userId", select: "names" },
      });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("Error fetching loan by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLoan = async (req, res) => {
  try {
    const { amountPaid, status } = req.body;
    const { id } = req.params;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (amountPaid !== undefined) {
      const amountToPay = Number(amountPaid);
      if (isNaN(amountToPay) || amountToPay <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid amountPaid. Must be a positive number." });
      }

      const cash = await Cash.findOne();
      if (!cash) {
        return res.status(404).json({ message: "Cash record not found." });
      }
      cash.amount += amountToPay;
      await cash.save();

      const newAmountOwed = loan.amountOwed - amountToPay;
      loan.amountOwed = Math.max(0, newAmountOwed);

      const purchaseInput = await PurchaseInput.findById(loan.purchaseInputId);
      if (purchaseInput) {
        purchaseInput.amountPaid += amountToPay;
        purchaseInput.amountRemaining = loan.amountOwed;
        purchaseInput.status = loan.amountOwed === 0 ? "paid" : "loan";
        await purchaseInput.save();
      } else {
        console.error("Associated purchase input not found.");
      }

      if (loan.amountOwed === 0) {
        loan.status = "repaid";
      }

      await loan.save();
    }

    if (status) {
      loan.status = status;
      await loan.save();

      if (status === "repaid" && loan.amountOwed === 0) {
        await Loan.findByIdAndDelete(id);
        return res
          .status(200)
          .json({ message: "Loan repaid and deleted successfully" });
      }
    }

    const updatedLoan = await Loan.findById(id)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: { path: "userId", select: "names" },
      });

    res
      .status(200)
      .json({ message: "Loan updated successfully", loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
