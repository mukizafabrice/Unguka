import mongoose from "mongoose";
import Loan from "../models/Loan.js"; // Ensure Loan model has 'cooperativeId' field
import PurchaseInput from "../models/PurchaseInput.js"; // Ensure PurchaseInput has 'cooperativeId' if linked
import Cash from "../models/Cash.js"; // Ensure Cash model has 'cooperativeId' if per-cooperative
import LoanTransaction from "../models/LoanTransaction.js"; // Ensure LoanTransaction has 'cooperativeId' if linked
import User from "../models/User.js"; // Assuming 'User' model represents members and has 'cooperativeId'

/**
 * @desc Create a new loan (borrow money)
 * @route POST /api/loans
 * @access Private (Member, Manager, Superadmin)
 * @assumption The `checkCooperativeAccess("body")` middleware ensures
 * that any `cooperativeId` provided in the body is valid for the manager's role,
 * or handles superadmin access. For 'member' role, explicit checks are added here.
 */
export const borrowMoney = async (req, res) => {
  // `userId` here refers to the ID of the individual (a member) taking the loan.
  const { userId: borrowerId, amountOwed, interest } = req.body;
  const authenticatedUser = req.user; // The authenticated user (member, manager, or superadmin)

  // Basic input validation
  if (!borrowerId || !amountOwed || amountOwed <= 0) {
    return res.status(400).json({ message: "Borrower ID and a positive loan amount are required." });
  }
  if (interest === undefined || interest < 0) {
    return res.status(400).json({ message: "Interest rate must be a non-negative number." });
  }

  try {
    // 1. Find the borrower to get their cooperative ID
    const borrower = await User.findById(borrowerId);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found." });
    }
    if (!borrower.cooperativeId) {
        return res.status(400).json({ message: "Borrower must be associated with a cooperative." });
    }

    let loanCooperativeId = borrower.cooperativeId; // The loan will be tied to the borrower's cooperative

    // 2. Authorization checks based on the authenticated user's role
    if (authenticatedUser.role === 'member') {
      // A member can only create a loan for themselves
      if (borrowerId.toString() !== authenticatedUser.id.toString()) {
        return res.status(403).json({ message: "Access denied. Members can only create loans for themselves." });
      }
      // Ensure the loan's cooperative matches the authenticated member's cooperative
      if (loanCooperativeId.toString() !== authenticatedUser.cooperativeId.toString()) {
          return res.status(403).json({ message: "Loan's cooperative ID must match authenticated member's cooperative ID." });
      }
    } else if (authenticatedUser.role === 'manager') {
      // A manager can create loans for members within their own cooperative
      if (loanCooperativeId.toString() !== authenticatedUser.cooperativeId.toString()) {
        return res.status(403).json({ message: "Access denied. Managers can only create loans for members within their cooperative." });
      }
    }
    // Superadmin has no cooperative restriction and can create loans for any member in any cooperative.

    // 3. Calculate the total amount owed (including interest)
    const newAmountOwed = amountOwed * (1 + interest / 100);

    // 4. Create and save the new loan
    const loan = new Loan({
      userId: borrowerId, // The ID of the member taking the loan
      amountOwed: newAmountOwed,
      interest,
      cooperativeId: loanCooperativeId, // Loan is explicitly associated with the borrower's cooperative
    });

    await loan.save();

    res.status(201).json({
      success: true,
      message: "New loan created successfully.",
      loan,
    });
  } catch (error) {
    console.error("Error creating new loan:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid borrower ID format." });
    }
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

/**
 * @desc Get all loans
 * @route GET /api/loans
 * @access Private (Manager, Superadmin)
 * @assumption The `checkCooperativeAccess("query")` middleware adds `cooperativeId` to `req.query`
 * for 'manager' role, effectively filtering loans to their cooperative.
 * For 'superadmin', no `cooperativeId` is added, allowing them to see all.
 * Members are not expected to use this route to get *all* loans.
 */
export const getAllLoans = async (req, res) => {
  try {
    let filter = {};

    // If cooperativeId is present in query (added by middleware for managers), apply it
    if (req.query.cooperativeId) {
      filter.cooperativeId = req.query.cooperativeId;
    }

    const loans = await Loan.find(filter)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: [
          { path: "userId", select: "names" }, // Populate borrower's name on purchase input
          { path: "productId", select: "productName" },
          { path: "seasonId", select: "name year" },
        ],
      })
      .populate("userId", "names") // Populate the borrower's name directly on the loan
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get a single loan by ID
 * @route GET /api/loans/:id
 * @access Private (Member, Manager, Superadmin)
 * @assumption The `checkCooperativeAccess("params")` middleware (when applied to `:id` routes)
 * handles the specific document-level authorization, ensuring the current user
 * (member, manager, superadmin) has access to this particular loan based on their role and cooperative.
 */
export const getLoanById = async (req, res) => {
  const loanId = req.params.id;

  try {
    // Middleware should have ensured authorization, so just fetch and return.
    const loan = await Loan.findById(loanId)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: { path: "userId", select: "names" },
      })
      .populate("userId", "names"); // Populate the borrower's name directly on the loan

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("Error fetching loan by ID:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid loan ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update a loan by ID (e.g., record a payment or change status)
 * @route PUT /api/loans/:id
 * @access Private (Manager, Superadmin)
 * @assumption The `checkCooperativeAccess("params")` middleware handles the specific
 * document-level authorization for 'manager' and 'superadmin' roles.
 * Members are not permitted to update loans directly via this route.
 */
export const updateLoan = async (req, res) => {
  try {
    const { amountPaid, status } = req.body;
    const { id } = req.params;
    const currentUserCoopId = req.user.cooperativeId; // For accessing cooperative-specific Cash model

    let loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Middleware already authorized access to this loan; no need for redundant checks here.

    if (amountPaid !== undefined) {
      const amountToPay = Number(amountPaid);
      if (isNaN(amountToPay) || amountToPay <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid amountPaid. Must be a positive number." });
      }

      // Find the cash record for the current manager's cooperative
      // Assuming the Cash model is per-cooperative and managers handle cash for their coop
      const cash = await Cash.findOne({ cooperativeId: currentUserCoopId });
      if (!cash) {
        return res.status(404).json({ message: "Cash record not found for this cooperative." });
      }
      cash.amount += amountToPay;
      await cash.save();

      const newAmountOwed = loan.amountOwed - amountToPay;
      loan.amountOwed = Math.max(0, newAmountOwed);

      // Update associated PurchaseInput if exists
      const purchaseInput = await PurchaseInput.findById(loan.purchaseInputId);
      if (purchaseInput) {
        purchaseInput.amountPaid += amountToPay;
        purchaseInput.amountRemaining = loan.amountOwed;
        purchaseInput.status = loan.amountOwed === 0 ? "paid" : "loan";
        await purchaseInput.save();
      } else {
        console.warn("Associated purchase input not found for loan:", loan._id);
      }

      // Create a loan transaction record
      const loanTransaction = new LoanTransaction({
        loanId: loan._id,
        amountPaid: amountToPay,
        amountRemainingToPay: loan.amountOwed,
        transactionDate: new Date(),
        cooperativeId: loan.cooperativeId, // Inherit cooperativeId from the loan
      });
      await loanTransaction.save();

      // Update loan status if fully repaid
      if (loan.amountOwed === 0) {
        loan.status = "repaid";
      }

      await loan.save();
    }

    // Handle status update separately if provided
    if (status) {
      loan.status = status;
      await loan.save();

      // If loan is fully repaid and status is explicitly set to 'repaid', delete it
      if (status === "repaid" && loan.amountOwed === 0) {
        await Loan.findByIdAndDelete(id);
        return res
          .status(200)
          .json({ message: "Loan repaid and deleted successfully" });
      }
    }

    // Re-fetch the updated loan with populated fields for the response
    const updatedLoan = await Loan.findById(id)
      .populate("purchaseInputId")
      .populate({
        path: "purchaseInputId",
        populate: { path: "userId", select: "names" },
      })
      .populate("userId", "names"); // Populate the borrower's name directly on the loan

    res
      .status(200)
      .json({ message: "Loan updated successfully", loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid loan ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a loan by ID
 * @route DELETE /api/loans/:id
 * @access Private (Manager, Superadmin)
 * @assumption The `checkCooperativeAccess("params")` middleware handles the specific
 * document-level authorization for 'manager' and 'superadmin' roles.
 * Members are not permitted to delete loans directly via this route.
 */
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    // Middleware already authorized access to this loan; no need for redundant checks here.
    const loan = await Loan.findByIdAndDelete(id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid loan ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all loans for a specific borrower ID
 * @route GET /api/users/:userId/loans
 * @access Private (Member, Manager, Superadmin)
 * @notes This function needs explicit cooperative filtering as it's not on the main `/api/loans` path,
 * and handles the 'member' role's self-access restriction.
 */
export const getLoansByUserId = async (req, res) => {
  const borrowerId = req.params.userId; // This is the ID of the member whose loans are being requested
  const authenticatedUser = req.user; // The authenticated user (member, manager, or superadmin)

  try {
    let filter = { userId: borrowerId }; // Start with filtering by the requested borrower's ID

    // Apply role-based access control and cooperative filtering
    if (authenticatedUser.role === 'member') {
      // A member can only fetch their own loans
      if (borrowerId.toString() !== authenticatedUser.id.toString()) {
         return res.status(403).json({ message: "Access denied. You can only view your own loans." });
      }
      // Loans must be within the authenticated member's cooperative
      filter.cooperativeId = authenticatedUser.cooperativeId;
    } else if (authenticatedUser.role === 'manager') {
      // A manager can only see loans for borrowers within their own cooperative
      filter.cooperativeId = authenticatedUser.cooperativeId;
    }
    // Superadmin has no cooperative filter here, can see all loans for any borrower.

    // Step 1: Get all purchaseInput IDs for this borrower, applying the combined filter
    const borrowerPurchaseInputs = await PurchaseInput.find(filter).select("_id");

    if (borrowerPurchaseInputs.length === 0) {
      return res
        .status(404)
        .json({ message: "No purchase inputs found for this borrower matching the criteria." });
    }

    const purchaseInputIds = borrowerPurchaseInputs.map((pi) => pi._id);

    // Step 2: Find all loans with those purchaseInput IDs, applying the cooperative filter again for safety
    const loans = await Loan.find({
      purchaseInputId: { $in: purchaseInputIds },
      ...filter // Re-apply the filter, including cooperativeId and userId (borrowerId)
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
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid borrower ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
