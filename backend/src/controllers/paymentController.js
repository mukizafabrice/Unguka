import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Loan from "../models/Loan.js";
import Fee from "../models/Fees.js";
import CooperativeCash from "../models/Cash.js";
import PurchaseInput from "../models/PurchaseInput.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import mongoose from "mongoose"; // Ensure mongoose is imported for ObjectId validation

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
  const { userId, amountPaid } = req.body;
  const { cooperativeId, role } = req.user;

  if (!userId || amountPaid === undefined || amountPaid === null) {
    return res
      .status(400)
      .json({ message: "userId and amountPaid are required" });
  }

  const paymentAmount = parseFloat(amountPaid);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
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
    const productions = await Production.find({
      ...memberPaymentFilter,
      paymentStatus: "pending",
    });
    const grossAmount = productions.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    );

    const unpaidFees = await Fee.find({
      ...memberPaymentFilter,
      status: { $ne: "paid" },
    });

    const totalFeesOutstanding = unpaidFees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    const unpaidLoans = await Loan.find({
      ...memberPaymentFilter,
      status: "pending",
    });
    const totalLoansOutstanding = unpaidLoans.reduce(
      (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: processMemberPayment - Unpaid Loans fetched by userId. Outstanding: ${totalLoansOutstanding}`
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

    const coopCash = await CooperativeCash.findOne({ cooperativeId });
    if (!coopCash) {
      return res.status(500).json({
        message: "Cooperative cash record not found for this cooperative.",
      });
    }
    if (coopCash.amount < paymentAmount) {
      return res
        .status(400)
        .json({ message: " we have less cash in cooperative" });
    }
    coopCash.amount -= paymentAmount;
    await coopCash.save();

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
        `[${new Date().toISOString()}] DEBUG: Existing partial payment found.`
      );

      // Update payment record fields
      paymentRecord.amountPaid += paymentAmount;
      paymentRecord.amountRemainingToPay = Math.max(
        amountDue - paymentRecord.amountPaid,
        0
      );
      paymentRecord.status =
        paymentRecord.amountRemainingToPay === 0 ? "paid" : "partial";

      if (!paymentRecord.transactions) paymentRecord.transactions = [];
      paymentRecord.transactions.push({
        date: new Date(),
        amount: paymentAmount,
      });

      // Optionally update grossAmount and totalDeductions if you want to accumulate
      paymentRecord.grossAmount += grossAmount;
      paymentRecord.totalDeductions += totalDeductions;

      await paymentRecord.save();

      console.log(
        `[${new Date().toISOString()}] DEBUG: Payment record updated.`
      );
    } else {
      // Create new payment record if none exists
      console.log(
        `[${new Date().toISOString()}] DEBUG: Creating new payment record.`
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
        `[${new Date().toISOString()}] DEBUG: New payment record saved.`
      );
    }

    // Always create a PaymentTransaction log
    console.log(
      `[${new Date().toISOString()}] DEBUG: Creating Payment Transaction Log...`
    );

    await PaymentTransaction.create({
      cooperativeId,
      userId,
      paymentId: paymentRecord._id,
      amountPaid: paymentAmount,
      amountRemainingToPay: paymentRecord.amountRemainingToPay,
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

export const getPaymentSummary = async (req, res) => {
  const { userId: paramUserId } = req.query;

  const { _id: authenticatedUserId, cooperativeId, role } = req.user;

  try {
    // Get the cooperative filter from your helper
    const cooperativeFilter = getCooperativeQueryFilter(req);

    // Combine cooperative filter with the specific userId
    const finalFilter = {
      ...cooperativeFilter,
      userId: paramUserId,
    };

    // --- Productions ---
    const productions = await Production.find({
      ...finalFilter,
      paymentStatus: "pending",
    });
    const totalProduction = productions.reduce(
      (sum, prod) => sum + (prod.totalPrice || 0),
      0
    );

    // --- Loans directly by userId ---
    const loans = await Loan.find({
      ...finalFilter,
      status: "pending",
    });

    const totalLoans = loans.reduce(
      (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );
    console.log(
      `[${new Date().toISOString()}] DEBUG: getPaymentSummary - Loans fetched by userId. Count: ${
        loans.length
      }`
    );

    // --- Fees ---
    const fees = await Fee.find({ ...finalFilter, status: { $ne: "paid" } });
    const totalUnpaidFees = fees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    // --- Partial payments ---
    const allPartialPaymentsForUser = await Payment.find({
      ...finalFilter,
      status: "partial",
    });
    const previousRemaining = allPartialPaymentsForUser.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );

    // --- Net calculation ---
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

export const getPaymentSummaryByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const productions = await Production.find({
      userId,
      paymentStatus: "pending",
    });
    const totalProduction = productions.reduce(
      (sum, prod) => sum + (prod.totalPrice || 0),
      0
    );

    const purchaseInputs = await PurchaseInput.find({ userId });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);

    // ✅ Fetch ALL pending loans
    const loans = await Loan.find({
      ...userId,
      purchaseInputId: { $in: purchaseInputIds },
      status: "pending",
    });
    const totalLoans = loans.reduce(
      (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );

    // ✅ Fetch ALL unpaid fees
    const fees = await Fee.find({ userId, status: { $ne: "paid" } });
    const totalUnpaidFees = fees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    // ✅ Get all partial payments for this user (across all time)
    const allPartialPaymentsForUser = await Payment.find({
      userId,
      status: "partial",
    });

    const previousRemaining = allPartialPaymentsForUser.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );

    // ✅ Final computation
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
    console.error("Error fetching payment summary:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
