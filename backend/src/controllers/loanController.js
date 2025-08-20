import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";
import Cash from "../models/Cash.js";
import LoanTransaction from "../models/LoanTransaction.js";
import User from "../models/User.js";
import Season from "../models/Season.js";

export const createLoan = async (req, res) => {
  const { userId, seasonId, amountOwed, interest } = req.body;
  const { role, cooperativeId } = req.user;

  // 1. Role-Based Access Control
  if (role !== "manager") {
    return res
      .status(403)
      .json({ message: "Access denied. Only managers can create loans." });
  }

  // 2. Input Validation
  if (!userId || !amountOwed || amountOwed <= 0) {
    return res
      .status(400)
      .json({ message: "User ID and a positive loan amount are required." });
  }

  try {
    // 3. Verify the borrower exists and belongs to the manager's cooperative
    const borrower = await User.findById(userId);
    if (
      !borrower ||
      borrower.cooperativeId.toString() !== cooperativeId.toString()
    ) {
      return res.status(404).json({
        message: "User not found or not a member of your cooperative.",
      });
    }
    // 1. Corrected the interest calculation to include the principal amount
    const newAmountOwed = amountOwed * (1 + interest / 100);

    // 4. Create the loan document
    const newLoan = new Loan({
      userId,
      seasonId,
      amountOwed: newAmountOwed,
      interest,
      cooperativeId, // CRITICAL: Securely set cooperativeId from the authenticated user
      status: "pending",
    });

    await newLoan.save();

    res.status(201).json({
      success: true,
      message: "New loan created successfully.",
      loan: newLoan,
    });
  } catch (error) {
    console.error("Error creating new loan:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

// @desc    Get all loans for the user's cooperative
// @route   GET /api/loans
// @access  Private (Manager, Superadmin)
export const getAllLoans = async (req, res) => {
  const { role, cooperativeId } = req.user;

  if (role !== "manager" && role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only managers can view all loans." });
  }

  try {
    // CRITICAL: Filter loans by the authenticated user's cooperative ID
    const loans = await Loan.find({ cooperativeId })
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

// @desc    Get a single loan by ID
// @route   GET /api/loans/:id
// @access  Private (Member, Manager, Superadmin)
export const getLoanById = async (req, res) => {
  const { userId } = req.params;
  const { role, cooperativeId } = req.user;

  try {
    // CRITICAL: Find the loan by ID AND cooperativeId
    const loan = await Loan.find({ userId, cooperativeId })
      .populate("purchaseInputId")
      .populate("userId", "names")
      .populate("seasonId", "name year")
      .populate({
        path: "purchaseInputId",
        populate: [{ path: "productId", select: "productName" }],
      });

    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found in your cooperative." });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("Error fetching loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Private (Manager)
export const updateLoan = async (req, res) => {
  const { id } = req.params;
  const { amountPaid, status, userId, seasonId } = req.body;
  const { role, cooperativeId } = req.user;

  if (role !== "manager") {
    return res
      .status(403)
      .json({ message: "Access denied. Only managers can update loans." });
  }

  try {
    // 1. Find the loan within the manager's cooperative
    const loan = await Loan.findOne({ _id: id, cooperativeId });
    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found in your cooperative." });
    }

    // 2. Update userId and seasonId if they are provided in the request body
    // This allows reassigning the loan to a different member or season.
    if (userId) {
      // You may want to add validation here to ensure the new userId belongs to the same cooperative.
      const newMember = await User.findOne({ _id: userId, cooperativeId });
      if (!newMember) {
        return res
          .status(400)
          .json({ message: "The new member is not part of this cooperative." });
      }
      loan.userId = userId;
    }

    if (seasonId) {
      // You can add validation here to ensure the season exists
      // const newSeason = await Season.findById(seasonId);
      // if (!newSeason) {
      //   return res.status(400).json({ message: "The selected season does not exist." });
      // }
      loan.seasonId = seasonId;
    }

    // 3. Handle amount paid logic as before
    if (amountPaid !== undefined) {
      const amountToPay = Number(amountPaid);
      if (isNaN(amountToPay) || amountToPay <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid amountPaid. Must be a positive number." });
      }

      const cash = await Cash.findOne({ cooperativeId });
      if (!cash) {
        return res
          .status(404)
          .json({ message: "Cash record not found for this cooperative." });
      }
      cash.amount += amountToPay;
      await cash.save();

      loan.amountOwed = Math.max(0, loan.amountOwed - amountToPay);

      const loanTransaction = new LoanTransaction({
        loanId: loan._id,
        amountPaid: amountToPay,
        amountRemainingToPay: loan.amountOwed,
        transactionDate: new Date(),
        cooperativeId,
      });
      await loanTransaction.save();
    }

    // 4. Handle status update
    if (status) {
      loan.status = status;
    }

    // 5. Automatically set status to 'repaid' if amount owed is 0
    if (loan.amountOwed <= 0) {
      loan.status = "repaid";
    }

    // 6. Save the updated loan document
    await loan.save();

    res.status(200).json({ message: "Loan updated successfully", loan });
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a loan
// @route   DELETE /api/loans/:id
// @access  Private (Manager)
export const deleteLoan = async (req, res) => {
  const { id } = req.params;
  const { role, cooperativeId } = req.user;

  if (role !== "manager") {
    return res
      .status(403)
      .json({ message: "Access denied. Only managers can delete loans." });
  }

  try {
    // CRITICAL: Find and delete the loan by both ID and cooperativeId
    const loan = await Loan.findOneAndDelete({ _id: id, cooperativeId });

    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found in your cooperative." });
    }

    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
