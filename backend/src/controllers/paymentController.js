import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Loan from "../models/Loan.js";
import Fee from "../models/Fees.js";
import CooperativeCash from "../models/Cash.js";
import PurchaseInput from "../models/PurchaseInput.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import mongoose from "mongoose"; // Ensure mongoose is imported for ObjectId validation

// Helper to construct query filter based on user role and cooperativeId
// This function is robust and should remain as is for security and multi-tenancy.
const getCooperativeQueryFilter = (req) => {
  const { role, cooperativeId } = req.user;

  console.log(
    `[${new Date().toISOString()}] DEBUG: getCooperativeQueryFilter - Role: ${role}, CooperativeId from JWT: ${cooperativeId}`
  );

  if (role === "superadmin") {
    if (
      req.query.cooperativeId &&
      mongoose.Types.ObjectId.isValid(req.query.cooperativeId)
    ) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: Superadmin: Filtering by cooperativeId from query: ${
          req.query.cooperativeId
        }`
      );
      return { cooperativeId: req.query.cooperativeId };
    }
    console.log(
      `[${new Date().toISOString()}] DEBUG: Superadmin: No specific cooperativeId in query, returning all.`
    );
    return {};
  }

  if (!cooperativeId) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Cooperative ID not found in user token for role ${role}. Authentication misconfiguration.`
    );
    throw new Error(
      "Cooperative ID not found in user token. Authentication misconfiguration."
    );
  }
  console.log(
    `[${new Date().toISOString()}] DEBUG: Manager/Member: Filtering by cooperativeId from JWT: ${cooperativeId}`
  );
  return { cooperativeId: cooperativeId };
};

export const processMemberPayment = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] DEBUG: processMemberPayment START`
  );
  const { userId, amountPaid } = req.body;
  const { cooperativeId, role } = req.user; // Get cooperativeId and role from authenticated user

  if (!userId || amountPaid === undefined || amountPaid === null) {
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Invalid input: userId or amountPaid missing.`
    );
    return res
      .status(400)
      .json({ message: "userId and amountPaid are required" });
  }

  const paymentAmount = parseFloat(amountPaid);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Invalid amountPaid: ${amountPaid}`
    );
    return res
      .status(400)
      .json({ message: "Amount paid must be a positive number." });
  }

  const memberPaymentFilter = { userId, cooperativeId };
  console.log(
    `[${new Date().toISOString()}] DEBUG: processMemberPayment - memberPaymentFilter: ${JSON.stringify(
      memberPaymentFilter
    )}`
  );

  try {
    // --- DATABASE QUERIES START ---
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Querying Productions...`
    );
    const productions = await Production.find({
      ...memberPaymentFilter,
      paymentStatus: "pending",
    });
    const grossAmount = productions.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Productions fetched. Gross Amount: ${grossAmount}`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Querying Unpaid Fees...`
    );
    const unpaidFees = await Fee.find({
      ...memberPaymentFilter,
      status: { $ne: "paid" },
    });
    const totalFeesOutstanding = unpaidFees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Unpaid Fees fetched. Outstanding: ${totalFeesOutstanding}`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Querying PurchaseInputs...`
    );
    const purchaseInputs = await PurchaseInput.find({ ...memberPaymentFilter });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - PurchaseInputs fetched. IDs: ${
        purchaseInputIds.length
      }`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Querying Unpaid Loans...`
    );
    const unpaidLoans = await Loan.find({
      ...memberPaymentFilter,
      purchaseInputId: { $in: purchaseInputIds },
      status: "pending",
    });
    const totalLoansOutstanding = unpaidLoans.reduce(
      (sum, loan) => sum + (loan.amountOwed || 0),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Unpaid Loans fetched. Outstanding: ${totalLoansOutstanding}`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Querying Partial Payments...`
    );
    const partialPayments = await Payment.find({
      ...memberPaymentFilter,
      status: "partial",
    });
    const previousBalance = partialPayments.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Partial Payments fetched. Previous Balance: ${previousBalance}`
    );
    // --- DATABASE QUERIES END ---

    const totalDeductions = totalFeesOutstanding + totalLoansOutstanding;
    const amountDue = grossAmount - totalDeductions + previousBalance;
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Calculated Amount Due: ${amountDue}`
    );

    if (paymentAmount > amountDue) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: processMemberPayment - Amount paid exceeds amount due.`
      );
      return res.status(400).json({
        message: `Amount paid (${paymentAmount}) exceeds amount due (${amountDue.toFixed(
          2
        )}).`,
      });
    }

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Updating Cooperative Cash...`
    );
    const coopCash = await CooperativeCash.findOne({ cooperativeId });
    if (!coopCash) {
      console.error(
        `[${new Date().toISOString()}] ERROR: Cooperative cash record not found for cooperativeId: ${cooperativeId}`
      );
      return res.status(500).json({
        message: "Cooperative cash record not found for this cooperative.",
      });
    }
    coopCash.balance += paymentAmount;
    await coopCash.save();
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Cooperative Cash updated. New balance: ${
        coopCash.balance
      }`
    );

    // Payment Record Handling
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Handling Payment Record...`
    );
    let paymentRecord = await Payment.findOne({
      ...memberPaymentFilter,
      status: "partial",
    });

    if (paymentRecord) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: processMemberPayment - Existing partial payment found.`
      );
      if (amountDue > paymentAmount) {
        // This logic creates a new payment record if a new "partial" state is needed
        paymentRecord.amountRemainingToPay = 0; // The old partial payment is now considered fully paid towards its original amount
        paymentRecord.status = "paid";
        if (!paymentRecord.transactions) paymentRecord.transactions = [];
        paymentRecord.transactions.push({
          date: new Date(),
          amount: paymentAmount,
        });
        await paymentRecord.save();
        console.log(
          `[${new Date().toISOString()}] DEBUG: processMemberPayment - Old partial record marked paid.`
        );

        const newAmountRemainingToPay = amountDue - paymentAmount;
        const newGrossAmount = paymentRecord.grossAmount + grossAmount; // Accumulating previous gross with new
        const newtotalDeductions =
          paymentRecord.totalDeductions + totalDeductions; // Accumulating previous deductions with new

        const newRecord = new Payment({
          cooperativeId,
          userId,
          grossAmount: newGrossAmount,
          totalDeductions: newtotalDeductions,
          amountDue, // This amountDue is based on the current calculation, not the previous record's. Review if this is desired.
          amountPaid: paymentAmount,
          amountRemainingToPay: newAmountRemainingToPay,
          status: "partial",
          transactions: [{ date: new Date(), amount: paymentAmount }],
        });
        await newRecord.save();
        paymentRecord = newRecord; // Set paymentRecord to the newly created partial record
        console.log(
          `[${new Date().toISOString()}] DEBUG: processMemberPayment - New partial record created.`
        );
      } else {
        // Payment covers outstanding amount of existing partial record or more
        paymentRecord.amountPaid += paymentAmount;
        paymentRecord.amountRemainingToPay = 0;
        paymentRecord.status = "paid";
        if (!paymentRecord.transactions) paymentRecord.transactions = [];
        paymentRecord.transactions.push({
          date: new Date(),
          amount: paymentAmount,
        });
        await paymentRecord.save();
        console.log(
          `[${new Date().toISOString()}] DEBUG: processMemberPayment - Existing partial record fully paid.`
        );
      }
    } else {
      // Create new payment record (no previous partial payment found)
      console.log(
        `[${new Date().toISOString()}] DEBUG: processMemberPayment - Creating new payment record.`
      );
      paymentRecord = new Payment({
        cooperativeId,
        userId,
        grossAmount,
        totalDeductions,
        amountDue,
        amountPaid: paymentAmount,
        amountRemainingToPay: amountDue - paymentAmount,
        status: amountDue - paymentAmount === 0 ? "paid" : "partial",
        transactions: [{ date: new Date(), amount: paymentAmount }],
      });
      await paymentRecord.save();
      console.log(
        `[${new Date().toISOString()}] DEBUG: processMemberPayment - New payment record saved.`
      );
    }

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Creating Payment Transaction Log...`
    );
    await PaymentTransaction.create({
      cooperativeId,
      userId,
      paymentId: paymentRecord._id,
      amountPaid: paymentAmount,
      amountRemainingToPay: amountDue - paymentAmount,
      transactionDate: new Date(),
    });

    if (productions.length > 0) {
      await Production.updateMany(
        { ...memberPaymentFilter, paymentStatus: "pending" },
        { $set: { paymentStatus: "paid" } }
      );
      console.log(
        `[${new Date().toISOString()}] DEBUG: processMemberPayment - Productions updated.`
      );
    }

    if (paymentAmount > 0) {
      await Promise.all(
        unpaidFees.map(async (fee) => {
          if (fee.cooperativeId.toString() === cooperativeId.toString()) {
            fee.amountPaid = fee.amountOwed;
            fee.status = "paid";
            fee.paidAt = new Date();
            await fee.save();
            console.log(
              `[${new Date().toISOString()}] DEBUG: processMemberPayment - Fee ${
                fee._id
              } updated.`
            );
          }
        })
      );
    }

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Updating Unpaid Loans...`
    );
    if (paymentAmount > 0) {
      await Promise.all(
        unpaidLoans.map(async (loan) => {
          if (loan.cooperativeId.toString() === cooperativeId.toString()) {
            loan.amountPaid = loan.amountOwed;
            loan.status = "repaid";
            await loan.save();
            console.log(
              `[${new Date().toISOString()}] DEBUG: processMemberPayment - Loan ${
                loan._id
              } updated.`
            );
          }
        })
      );
    }

    if (paymentAmount > 0) {
      await Promise.all(
        purchaseInputs.map(async (purchaseInput) => {
          if (
            purchaseInput.cooperativeId.toString() === cooperativeId.toString()
          ) {
            purchaseInput.amountPaid = purchaseInput.totalPrice;
            purchaseInput.amountRemaining = 0;
            purchaseInput.status = "paid";
            await purchaseInput.save();
            console.log(
              `[${new Date().toISOString()}] DEBUG: processMemberPayment - PurchaseInput ${
                purchaseInput._id
              } updated.`
            );
          }
        })
      );
    }

    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment END (Success)`
    );
    return res.status(200).json({
      message: "Payment processed successfully",
      payment: paymentRecord,
      coopCashBalance: coopCash.balance,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error processing member payment: ${
        error.message
      }`,
      error
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const filter = getCooperativeQueryFilter(req);
    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPayments: Applied filter: ${JSON.stringify(
        filter
      )}`
    );
    const payments = await Payment.find(filter)
      .populate("userId", "names")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPayments Controller END (Success)`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error fetching all payments: ${
        error.message
      }`,
      error
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  const { userId } = req.params;
  try {
    const payments = await Payment.find({ userId })
      .populate("userId", "names")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================================================================
// --- Update Payment ---
// ====================================================================
export const updatePayment = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] DEBUG: updatePayment Controller START`
  );
  try {
    const { id } = req.params;
    const { role, cooperativeId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: updatePayment - Invalid payment ID: ${id}`
      );
      return res.status(400).json({ message: "Invalid payment ID." });
    }

    const filter = getCooperativeQueryFilter(req);
    console.log(
      `[${new Date().toISOString()}] DEBUG: updatePayment - Applied filter: ${JSON.stringify(
        filter
      )}`
    );

    if (
      req.body.cooperativeId &&
      req.body.cooperativeId.toString() !== cooperativeId.toString() &&
      role !== "superadmin"
    ) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: updatePayment - Unauthorized attempt to change cooperative ID.`
      );
      return res.status(403).json({
        message:
          "You are not authorized to change the cooperative ID of a payment.",
      });
    }

    console.log(
      `[${new Date().toISOString()}] DEBUG: updatePayment - DB Query START: Payment.findOneAndUpdate...`
    );
    const updated = await Payment.findOneAndUpdate(
      { _id: id, ...filter },
      req.body,
      { new: true, runValidators: true }
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: updatePayment - DB Query END. Updated: ${!!updated}`
    );

    if (!updated) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: updatePayment - Payment not found or access denied for ID: ${id}`
      );
      return res.status(404).json({
        message: "Payment not found or you do not have access to it.",
      });
    }
    res.status(200).json(updated);
    console.log(
      `[${new Date().toISOString()}] DEBUG: updatePayment Controller END (Success)`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error updating payment: ${
        error.message
      }`,
      error
    );
    res.status(500).json({ message: error.message });
  }
};

// ====================================================================
// --- Delete Payment ---
// ====================================================================
export const deletePayment = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] DEBUG: deletePayment Controller START`
  );
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: deletePayment - Invalid payment ID: ${id}`
      );
      return res.status(400).json({ message: "Invalid payment ID." });
    }

    const filter = getCooperativeQueryFilter(req);
    console.log(
      `[${new Date().toISOString()}] DEBUG: deletePayment - Applied filter: ${JSON.stringify(
        filter
      )}`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: deletePayment - DB Query START: Payment.findOneAndDelete...`
    );
    const deleted = await Payment.findOneAndDelete({ _id: id, ...filter });
    console.log(
      `[${new Date().toISOString()}] DEBUG: deletePayment - DB Query END. Deleted: ${!!deleted}`
    );

    if (!deleted) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: deletePayment - Payment not found or access denied for ID: ${id}`
      );
      return res.status(404).json({
        message: "Payment not found or you do not have access to it.",
      });
    }
    res.status(200).json({ message: "Payment deleted" });
    console.log(
      `[${new Date().toISOString()}] DEBUG: deletePayment Controller END (Success)`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error deleting payment: ${
        error.message
      }`,
      error
    );
    res.status(500).json({ message: error.message });
  }
};

// ====================================================================
// --- Payment Summary (Complex Calculations, Requires Indexing) ---
// ====================================================================
export const getPaymentSummary = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] DEBUG: getPaymentSummary Controller START`
  );
  const { userId: paramUserId } = req.query; // userId for whom summary is requested
  // --- MODIFIED: Correctly destructure _id as authenticatedUserId ---
  const { _id: authenticatedUserId, cooperativeId, role } = req.user;
  // --- END MODIFIED ---

  // Basic authorization check: non-superadmin can only query their own user ID
  // MODIFIED: Added defensive check for authenticatedUserId before calling .toString()
  // if (
  //   role !== "superadmin" &&
  //   (!authenticatedUserId || paramUserId !== authenticatedUserId.toString())
  // ) {
  //   console.log(
  //     `[${new Date().toISOString()}] DEBUG: getPaymentSummary - Unauthorized attempt or missing authenticatedUserId.`
  //   );
  //   return res
  //     .status(403)
  //     .json({
  //       message:
  //         "You are not authorized to view payment summary for this user.",
  //     });
  // }

  try {
    // Get the cooperative filter from the helper, which handles superadmin vs manager/member logic
    const cooperativeFilter = getCooperativeQueryFilter(req);

    // Combine the cooperative filter with the specific userId for the summary
    const finalFilter = {
      ...cooperativeFilter, // This will be { cooperativeId: '...' } or {}
      userId: paramUserId, // Add the specific userId to filter by
    };

    const productions = await Production.find({
      ...finalFilter,
      paymentStatus: "pending",
    });
    const totalProduction = productions.reduce(
      (sum, prod) => sum + (prod.totalPrice || 0),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: getPaymentSummary - Productions fetched. Count: ${
        productions.length
      }`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: getPaymentSummary - Querying PurchaseInputs with filter: ${JSON.stringify(
        finalFilter
      )}`
    );
    const purchaseInputs = await PurchaseInput.find({ ...finalFilter });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);
    console.log(
      `[${new Date().toISOString()}] DEBUG: getPaymentSummary - PurchaseInputs fetched. Count: ${
        purchaseInputs.length
      }`
    );

    console.log(
      `[${new Date().toISOString()}] DEBUG: getPaymentSummary - Querying Loans with filter: ${JSON.stringify(
        finalFilter
      )}`
    );
    const loans = await Loan.find({
      ...finalFilter,
      purchaseInputId: { $in: purchaseInputIds },
      status: "pending",
    });
    const totalLoans = loans.reduce(
      (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: getPaymentSummary - Loans fetched. Count: ${
        loans.length
      }`
    );

    const fees = await Fee.find({ ...finalFilter, status: { $ne: "paid" } });
    const totalUnpaidFees = fees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    const allPartialPaymentsForUser = await Payment.find({
      ...finalFilter,
      status: "partial",
    });
    const previousRemaining = allPartialPaymentsForUser.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );
    // --- DATABASE QUERIES END ---

    const currentDeductions = totalLoans + totalUnpaidFees;
    const currentNet = totalProduction - currentDeductions;
    const netPayable = currentNet + previousRemaining;

    return res.status(200).json({
      totalProduction,
      totalLoans,
      totalUnpaidFees,
      previousRemaining,
      currentNet,
      netPayable: netPayable > 0 ? netPayable : 0,
      loans,
      fees,
      payments: allPartialPaymentsForUser,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error fetching payment summary: ${
        error.message
      }`,
      error
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
