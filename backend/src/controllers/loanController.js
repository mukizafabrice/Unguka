import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";
import Cash from "../models/Cash.js";
import LoanTransaction from "../models/LoanTransaction.js";
import User from "../models/User.js";

export const borrowMoney = async (req, res) => {
  const { userId: borrowerId, amountOwed, interest } = req.body;
  const authenticatedUser = req.user;

  if (!borrowerId || !amountOwed || amountOwed <= 0) {
    return res
      .status(400)
      .json({
        message: "Borrower ID and a positive loan amount are required.",
      });
  }
  if (interest === undefined || interest < 0) {
    return res
      .status(400)
      .json({ message: "Interest rate must be a non-negative number." });
  }

  try {
    const borrower = await User.findById(borrowerId);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found." });
    }
    if (!borrower.cooperativeId) {
      return res
        .status(400)
        .json({ message: "Borrower must be associated with a cooperative." });
    }

    let loanCooperativeId = borrower.cooperativeId;

    if (authenticatedUser.role === "member") {
      if (borrowerId.toString() !== authenticatedUser.id.toString()) {
        return res
          .status(403)
          .json({
            message:
              "Access denied. Members can only create loans for themselves.",
          });
      }
      if (
        loanCooperativeId.toString() !==
        authenticatedUser.cooperativeId.toString()
      ) {
        return res
          .status(403)
          .json({
            message:
              "Loan's cooperative ID must match authenticated member's cooperative ID.",
          });
      }
    } else if (authenticatedUser.role === "manager") {
      if (
        loanCooperativeId.toString() !==
        authenticatedUser.cooperativeId.toString()
      ) {
        return res
          .status(403)
          .json({
            message:
              "Access denied. Managers can only create loans for members within their cooperative.",
          });
      }
    }

    const newAmountOwed = amountOwed * (1 + interest / 100);

    const loan = new Loan({
      userId: borrowerId,
      amountOwed: newAmountOwed,
      interest,
      cooperativeId: loanCooperativeId,
    });

    await loan.save();

    res.status(201).json({
      success: true,
      message: "New loan created successfully.",
      loan,
    });
  } catch (error) {
    console.error("Error creating new loan:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid borrower ID format." });
    }
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

export const getAllLoans = async (req, res) => {
  try {
    let filter = {};

    if (req.query.cooperativeId) {
      filter.cooperativeId = req.query.cooperativeId;
    }

    const loans = await Loan.find(filter)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: [
          { path: "userId", select: "names" },
          { path: "productId", select: "productName" },
          { path: "seasonId", select: "name year" },
        ],
      })
      .populate("userId", "names")
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLoanById = async (req, res) => {
  const loanId = req.params.id;

  try {
    const loan = await Loan.findById(loanId)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: { path: "userId", select: "names" },
      })
      .populate("userId", "names");

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("Error fetching loan by ID:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid loan ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLoan = async (req, res) => {
  try {
    const { amountPaid, status } = req.body;
    const { id } = req.params;
    const currentUserCoopId = req.user.cooperativeId;

    let loan = await Loan.findById(id);
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

      const cash = await Cash.findOne({ cooperativeId: currentUserCoopId });
      if (!cash) {
        return res
          .status(404)
          .json({ message: "Cash record not found for this cooperative." });
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
        console.warn("Associated purchase input not found for loan:", loan._id);
      }

      const loanTransaction = new LoanTransaction({
        loanId: loan._id,
        amountPaid: amountToPay,
        amountRemainingToPay: loan.amountOwed,
        transactionDate: new Date(),
        cooperativeId: loan.cooperativeId,
      });
      await loanTransaction.save();

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
      })
      .populate("userId", "names");

    res
      .status(200)
      .json({ message: "Loan updated successfully", loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid loan ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findByIdAndDelete(id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid loan ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLoansByUserId = async (req, res) => {
  const borrowerId = req.params.userId;
  const authenticatedUser = req.user;

  try {
    let filter = { userId: borrowerId };

    if (authenticatedUser.role === "member") {
      if (borrowerId.toString() !== authenticatedUser.id.toString()) {
        return res
          .status(403)
          .json({
            message: "Access denied. You can only view your own loans.",
          });
      }
      filter.cooperativeId = authenticatedUser.cooperativeId;
    } else if (authenticatedUser.role === "manager") {
      filter.cooperativeId = authenticatedUser.cooperativeId;
    }

    const borrowerPurchaseInputs = await PurchaseInput.find(filter).select(
      "_id"
    );

    if (borrowerPurchaseInputs.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No purchase inputs found for this borrower matching the criteria.",
        });
    }

    const purchaseInputIds = borrowerPurchaseInputs.map((pi) => pi._id);

    const loans = await Loan.find({
      purchaseInputId: { $in: purchaseInputIds },
      ...filter,
    })
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: { path: "userId", select: "names" },
      })
      .populate("userId", "names")
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans by borrower ID:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid borrower ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
