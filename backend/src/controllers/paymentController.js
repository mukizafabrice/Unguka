// Revised Payment Controller (Clean, Correct)

import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Loan from "../models/Loan.js";
import Fee from "../models/Fees.js";
import CooperativeCash from "../models/Cash.js";
import PurchaseInput from "../models/PurchaseInput.js";

export const processMemberPayment = async (req, res) => {
  const { productionId, amountPaid } = req.body;

  try {
    const production = await Production.findById(productionId)
      .populate("userId")
      .populate("seasonId");
    if (!production)
      return res.status(404).json({ message: "Production not found" });

    const userId = production.userId._id;
    const seasonId = production.seasonId._id;
    const grossAmount = production.totalPrice;

    // Calculate unpaid fees
    const unpaidFees = await Fee.find({ userId, seasonId, status: "unpaid" });
    const totalFees = unpaidFees.reduce(
      (acc, fee) => acc + (fee.amountOwed - fee.amountPaid),
      0
    );

    // Calculate unpaid loans
    const purchaseInputs = await PurchaseInput.find({ userId, seasonId });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);

    const unpaidLoansRaw = await Loan.find({
      purchaseInputId: { $in: purchaseInputIds },
      status: "unpaid",
    });
    const totalLoans = unpaidLoansRaw.reduce(
      (acc, loan) => acc + loan.amountOwed,
      0
    );

    // Check for previous unpaid payments EXCLUDING the current production
    const otherUnpaid = await Payment.find({
      userId,
      seasonId,
      productionId: { $ne: productionId },
      status: { $ne: "paid" },
    });
    const totalOtherUnpaid = otherUnpaid.reduce(
      (acc, pay) => acc + pay.amountRemainingToPay,
      0
    );

    const totalDeductions = totalFees + totalLoans + totalOtherUnpaid;
    const amountDue = grossAmount - totalDeductions;

    if (amountPaid > amountDue) {
      return res
        .status(400)
        .json({ message: "Amount paid exceeds amount due" });
    }

    // Check cooperative cash
    const coopCash = await CooperativeCash.findOne();
    if (!coopCash || coopCash.balance < amountPaid) {
      return res
        .status(400)
        .json({ message: "Insufficient cooperative funds" });
    }

    coopCash.balance -= amountPaid;
    await coopCash.save();

    // Pay fees
    let remaining = amountPaid;
    for (const fee of unpaidFees) {
      const feeRemaining = fee.amountOwed - fee.amountPaid;
      if (remaining >= feeRemaining) {
        remaining -= feeRemaining;
        fee.amountPaid = fee.amountOwed;
        fee.status = "paid";
        fee.paidAt = new Date();
      } else if (remaining > 0) {
        fee.amountPaid += remaining;
        fee.status = "partial";
        remaining = 0;
      }
      await fee.save();
    }

    // Pay loans
    for (const loan of unpaidLoansRaw) {
      if (remaining >= loan.amountOwed) {
        remaining -= loan.amountOwed;
        loan.amountOwed = 0;
        loan.status = "paid";
      } else if (remaining > 0) {
        loan.amountOwed -= remaining;
        remaining = 0;
      }
      await loan.save();
    }

    const finalAmountPaid = amountPaid;
    const amountRemainingToPay = amountDue - finalAmountPaid;
    const status = amountRemainingToPay > 0 ? "partial" : "paid";

    // ✅ Check if a payment record already exists for this production
    let existingPayment = await Payment.findOne({
      userId,
      seasonId,
      productionId,
    });

    if (existingPayment) {
      // Update existing record
      existingPayment.amountPaid += finalAmountPaid;
      existingPayment.amountRemainingToPay =
        existingPayment.amountDue - existingPayment.amountPaid;
      existingPayment.status =
        existingPayment.amountRemainingToPay > 0 ? "partial" : "paid";
      await existingPayment.save();

      return res.status(200).json({
        message: "Payment updated successfully",
        payment: existingPayment,
      });
    } else {
      // Create new payment record
      const newPayment = new Payment({
        userId,
        productionId,
        seasonId,
        grossAmount,
        totalDeductions,
        amountDue,
        amountPaid: finalAmountPaid,
        amountRemainingToPay,
        status,
      });

      await newPayment.save();
      return res
        .status(201)
        .json({ message: "Payment processed", payment: newPayment });
    }
  } catch (error) {
    console.error("Error in payment processing:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "names")
      .populate("productionId", "totalPrice")
      .populate("seasonId", "name year");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "names")
      .populate("productionId", "totalPrice")
      .populate("seasonId", "name year");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentSummary = async (req, res) => {
  const { userId, seasonId, productionId } = req.query; // Destructure productionId

  if (!userId || !seasonId || !productionId) {
    // Add productionId validation
    return res
      .status(400)
      .json({ message: "userId, seasonId, and productionId are required" });
  }

  try {
    const productions = await Production.find({ userId, seasonId });
    const totalProduction = productions.reduce(
      (sum, prod) => sum + (prod.totalPrice || 0),
      0
    );

    const purchaseInputs = await PurchaseInput.find({ userId, seasonId });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);

    const loans = await Loan.find({
      purchaseInputId: { $in: purchaseInputIds },
      status: "pending",
    });
    const totalLoans = loans.reduce((sum, loan) => sum + loan.amountOwed, 0);

    const fees = await Fee.find({ userId, seasonId, status: { $ne: "paid" } });
    const totalUnpaidFees = fees.reduce(
      (sum, fee) => sum + (fee.amountOwed - fee.amountPaid),
      0
    );

    // Fetch all payments for the user and season
    const payments = await Payment.find({ userId, seasonId });

    // Filter payments to exclude the remaining balance from the production being paid against
    const paymentsForOtherProductions = payments.filter(
      (p) => p.productionId.toString() !== productionId
    );

    // Sum the remaining balances from other productions only
    const previousRemaining = paymentsForOtherProductions.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );

    // NOTE: This console.log will help you verify the values
    console.log({
      totalProduction,
      totalLoans,
      totalUnpaidFees,
      previousRemaining,
    });

    const netPayable =
      totalProduction - totalLoans - totalUnpaidFees - previousRemaining;

    res.status(200).json({
      totalProduction,
      totalLoans,
      totalUnpaidFees,
      previousRemaining,
      netPayable: netPayable > 0 ? netPayable : 0,
      loans,
      fees,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payment summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};
