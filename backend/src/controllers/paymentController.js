// Revised Payment Controller (Clean, Correct)

import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Loan from "../models/Loan.js";
import Fee from "../models/Fees.js";
import CooperativeCash from "../models/Cash.js";
import PurchaseInput from "../models/PurchaseInput.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

// export const processMemberPayment = async (req, res) => {
//   const { userId, seasonId, amountPaid } = req.body;

//   try {
//     // Step 1: Fetch all productions for the user and season
//     const productions = await Production.find({ userId, seasonId });
//     if (!productions || productions.length === 0) {
//       return res.status(404).json({ message: "No productions found." });
//     }

//     const grossAmount = productions.reduce(
//       (sum, p) => sum + (p.totalPrice || 0),
//       0
//     );

//     // Step 2: Calculate unpaid fees
//     const unpaidFees = await Fee.find({ userId, seasonId, status: "unpaid" });
//     const totalFees = unpaidFees.reduce(
//       (acc, fee) => acc + (fee.amountOwed - fee.amountPaid),
//       0
//     );

//     // Step 3: Calculate unpaid loans
//     const purchaseInputs = await PurchaseInput.find({ userId, seasonId });
//     const purchaseInputIds = purchaseInputs.map((p) => p._id);

//     const unpaidLoans = await Loan.find({
//       purchaseInputId: { $in: purchaseInputIds },
//       status: "unpaid",
//     });
//     const totalLoans = unpaidLoans.reduce(
//       (sum, loan) => sum + loan.amountOwed,
//       0
//     );

//     // Step 4: Exclude current payment but fetch other unpaid payments for the season
//     const otherUnpaidPayments = await Payment.find({
//       userId,
//       seasonId,
//       status: { $ne: "paid" },
//     });

//     const totalOtherUnpaid = otherUnpaidPayments.reduce(
//       (sum, p) => sum + p.amountRemainingToPay,
//       0
//     );

//     // Step 5: Calculate total due and apply amountPaid
//     const totalDeductions = totalFees + totalLoans ;
//     const amountDue = grossAmount - totalDeductions + totalOtherUnpaid;

//     if (amountPaid > amountDue) {
//       return res
//         .status(400)
//         .json({ message: "Amount paid exceeds amount due" });
//     }

//     // Step 6: Check cooperative cash
//     const coopCash = await CooperativeCash.findOne();
//     if (!coopCash || coopCash.balance < amountPaid) {
//       return res
//         .status(400)
//         .json({ message: "Insufficient cooperative funds" });
//     }

//     coopCash.balance -= amountPaid;
//     await coopCash.save();

//     // Step 7: Pay fees
//     let remaining = amountPaid;
//     for (const fee of unpaidFees) {
//       const feeRemaining = fee.amountOwed - fee.amountPaid;
//       if (remaining >= feeRemaining) {
//         remaining -= feeRemaining;
//         fee.amountPaid = fee.amountOwed;
//         fee.status = "paid";
//         fee.paidAt = new Date();
//       } else if (remaining > 0) {
//         fee.amountPaid += remaining;
//         fee.status = "partial";
//         remaining = 0;
//       }
//       await fee.save();
//     }

//     // Step 8: Pay loans
//     for (const loan of unpaidLoans) {
//       if (remaining >= loan.amountOwed) {
//         remaining -= loan.amountOwed;
//         loan.amountOwed = 0;
//         loan.status = "paid";
//       } else if (remaining > 0) {
//         loan.amountOwed -= remaining;
//         loan.status = "partial";
//         remaining = 0;
//       }
//       await loan.save();
//     }

//     const finalAmountPaid = amountPaid;
//     const amountRemainingToPay = amountDue - finalAmountPaid;
//     const status = amountRemainingToPay > 0 ? "partial" : "paid";

//     // Step 9: Create or update global payment record for this user & season
//     let existingPayment = await Payment.findOne({ userId, seasonId });

//     if (existingPayment) {
//       existingPayment.amountPaid += finalAmountPaid;
//       existingPayment.amountRemainingToPay =
//         existingPayment.amountDue - existingPayment.amountPaid;
//       existingPayment.status =
//         existingPayment.amountRemainingToPay > 0 ? "partial" : "paid";

//       await existingPayment.save();

//       return res.status(200).json({
//         message: "Payment updated successfully",
//         payment: existingPayment,
//       });
//     } else {
//       const newPayment = new Payment({
//         userId,
//         seasonId,
//         amountPaid: finalAmountPaid,
//         grossAmount,
//         totalDeductions,
//         amountDue,
//         amountRemainingToPay,
//         status,
//       });

//       await newPayment.save();

//       return res
//         .status(201)
//         .json({
//           message: "Payment processed successfully",
//           payment: newPayment,
//         });
//     }
//   } catch (error) {
//     console.error("Error in cooperative payment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const processMemberPayment = async (req, res) => {
  const { userId, seasonId, amountPaid } = req.body;

  if (!userId || !seasonId || amountPaid === undefined || amountPaid === null) {
    return res
      .status(400)
      .json({ message: "userId, seasonId, and amountPaid are required" });
  }

  const paymentAmount = parseFloat(amountPaid);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount paid must be a positive number." });
  }

  try {
    // Fetch productions for user and season to calculate gross earnings
    const productions = await Production.find({ userId, seasonId });
    if (!productions || productions.length === 0) {
      return res
        .status(404)
        .json({ message: "No productions found for this user in the season." });
    }
    const grossAmount = productions.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    );

    // Calculate unpaid fees for user in the season
    const unpaidFees = await Fee.find({
      userId,
      seasonId,
      status: { $ne: "paid" },
    });
    const totalFeesOutstanding = unpaidFees.reduce(
      (acc, fee) => acc + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    // Calculate unpaid loans for user in the season
    const purchaseInputs = await PurchaseInput.find({ userId, seasonId });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);
    const unpaidLoans = await Loan.find({
      purchaseInputId: { $in: purchaseInputIds },
      status: "pending",
    });
    const totalLoansOutstanding = unpaidLoans.reduce(
      (acc, loan) => acc + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );

    // Calculate previous partial payments for user across all seasons
    const allPartialPayments = await Payment.find({
      userId,
      status: "partial",
    });
    const previousRemainingBalance = allPartialPayments.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );

    const totalDeductions = totalFeesOutstanding + totalLoansOutstanding;
    const amountDue = grossAmount - totalDeductions + previousRemainingBalance;

    if (paymentAmount > amountDue) {
      return res.status(400).json({
        message: `Amount paid (${paymentAmount}) exceeds amount due (${amountDue.toFixed(
          2
        )}).`,
      });
    }

    // Update cooperative cash balance
    const coopCash = await CooperativeCash.findOne();
    if (!coopCash) {
      return res
        .status(500)
        .json({ message: "Cooperative cash record not found." });
    }

    coopCash.balance += paymentAmount;
    await coopCash.save();

    // Find existing payment for user and season
    let paymentRecord = await Payment.findOne({ userId, seasonId });
    if (paymentRecord) {
      paymentRecord.amountPaid += paymentAmount;
      paymentRecord.amountRemainingToPay -= paymentAmount;

      if (paymentRecord.amountRemainingToPay < 0)
        paymentRecord.amountRemainingToPay = 0;
      paymentRecord.status =
        paymentRecord.amountRemainingToPay === 0 ? "paid" : "partial";

      if (!paymentRecord.transactions) paymentRecord.transactions = [];
      paymentRecord.transactions.push({
        date: new Date(),
        amount: paymentAmount,
      });
      await paymentRecord.save();

      // ✅ NEW: Record transaction
      await PaymentTransaction.create({
        userId,
        seasonId,
        paymentId: paymentRecord._id,
        amountPaid: paymentAmount,
        amountRemainingToPay: paymentRecord.amountRemainingToPay,
        transactionDate: new Date(),
      });
    } else {
      // Create new payment record
      paymentRecord = new Payment({
        userId,
        seasonId,
        grossAmount,
        totalDeductions,
        amountDue,
        amountPaid: paymentAmount,
        amountRemainingToPay: amountDue - paymentAmount,
        status: amountDue - paymentAmount === 0 ? "paid" : "partial",
        transactions: [
          {
            date: new Date(),
            amount: paymentAmount,
          },
        ],
      });

      await paymentRecord.save();

      await PaymentTransaction.create({
        userId,
        seasonId,
        paymentId: paymentRecord._id,
        amountPaid: paymentAmount,
        amountRemainingToPay: paymentRecord.amountRemainingToPay,
        transactionDate: new Date(),
      });
    }

    // Distribute payment to unpaid fees
    let remainingPayment = paymentAmount;
    for (const fee of unpaidFees) {
      const feeRemaining = fee.amountOwed - (fee.amountPaid || 0);
      const applyAmount = Math.min(remainingPayment, feeRemaining);
      if (applyAmount > 0) {
        fee.amountPaid = (fee.amountPaid || 0) + applyAmount;
        fee.status = fee.amountPaid >= fee.amountOwed ? "paid" : "partial";
        if (fee.status === "paid") fee.paidAt = new Date();
        await fee.save();
        remainingPayment -= applyAmount;
        if (remainingPayment <= 0) break;
      }
    }

    // Distribute remaining payment to unpaid loans
    if (remainingPayment > 0) {
      for (const loan of unpaidLoans) {
        const loanRemaining = loan.amountOwed - (loan.amountPaid || 0);
        const applyAmount = Math.min(remainingPayment, loanRemaining);
        if (applyAmount > 0) {
          loan.amountPaid = (loan.amountPaid || 0) + applyAmount;
          if (loan.amountPaid >= loan.amountOwed) loan.status = "repaid";
          await loan.save();
          remainingPayment -= applyAmount;
          if (remainingPayment <= 0) break;
        }
      }
    }

    return res.status(200).json({
      message: "Payment processed successfully",
      payment: paymentRecord,
      coopCashBalance: coopCash.balance,
    });
  } catch (error) {
    console.error("Error processing member payment:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// In your backend controller (e.g., controllers/paymentController.js)

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("userId", "names") // Crucial: Populate userId and select only the 'names' field
      .populate("seasonId", "name year"); // Crucial: Populate seasonId and select 'name' and 'year' fields

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

// export const getPaymentSummary = async (req, res) => {
//   const { userId, seasonId, productionId } = req.query; // Destructure productionId

//   if (!userId || !seasonId || !productionId) {
//     // Add productionId validation
//     return res
//       .status(400)
//       .json({ message: "userId, seasonId, and productionId are required" });
//   }

//   try {
//     const productions = await Production.find({ userId, seasonId });
//     const totalProduction = productions.reduce(
//       (sum, prod) => sum + (prod.totalPrice || 0),
//       0
//     );

//     const purchaseInputs = await PurchaseInput.find({ userId, seasonId });
//     const purchaseInputIds = purchaseInputs.map((p) => p._id);

//     const loans = await Loan.find({
//       purchaseInputId: { $in: purchaseInputIds },
//       status: "pending",
//     });
//     const totalLoans = loans.reduce((sum, loan) => sum + loan.amountOwed, 0);

//     const fees = await Fee.find({ userId, seasonId, status: { $ne: "paid" } });
//     const totalUnpaidFees = fees.reduce(
//       (sum, fee) => sum + (fee.amountOwed - fee.amountPaid),
//       0
//     );

//     // Fetch all payments for the user and season
//     const payments = await Payment.find({ userId, seasonId });

//     // Filter payments to exclude the remaining balance from the production being paid against
//     const paymentsForOtherProductions = payments.filter(
//       (p) => p.productionId.toString() !== productionId
//     );

//     // Sum the remaining balances from other productions only
//     const previousRemaining = paymentsForOtherProductions.reduce(
//       (sum, p) => sum + (p.amountRemainingToPay || 0),
//       0
//     );

//     // NOTE: This console.log will help you verify the values
//     console.log({
//       totalProduction,
//       totalLoans,
//       totalUnpaidFees,
//       previousRemaining,
//     });

//     const netPayable =
//       totalProduction - totalLoans - totalUnpaidFees - previousRemaining;

//     res.status(200).json({
//       totalProduction,
//       totalLoans,
//       totalUnpaidFees,
//       previousRemaining,
//       netPayable: netPayable > 0 ? netPayable : 0,
//       loans,
//       fees,
//       payments,
//     });
//   } catch (error) {
//     console.error("Error fetching payment summary:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// A simplified view of the corrected backend route handler

// In your backend file (e.g., controllers/paymentController.js)
export const getPaymentSummary = async (req, res) => {
  const { userId, seasonId } = req.query;

  if (!userId || !seasonId) {
    return res
      .status(400)
      .json({ message: "userId and seasonId are required" });
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
    const totalLoans = loans.reduce(
      (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );

    const fees = await Fee.find({ userId, seasonId, status: { $ne: "paid" } });
    const totalUnpaidFees = fees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    const allPartialPaymentsForUser = await Payment.find({
      userId,
      status: "partial",
    });
    const previousRemaining = allPartialPaymentsForUser.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );

    const currentSeasonDeductions = totalLoans + totalUnpaidFees;
    const currentSeasonNet = totalProduction - currentSeasonDeductions;

    const netPayable = currentSeasonNet + previousRemaining;

    // --- NEW LOGIC FOR EXISTING PARTIAL PAYMENT FOR CURRENT SEASON ---
    const existingPartialPaymentForCurrentSeason = await Payment.findOne({
      userId,
      seasonId,
      status: "partial",
    });
    // --- END NEW LOGIC ---

    res.status(200).json({
      totalProduction,
      totalLoans,
      totalUnpaidFees,
      previousRemaining,
      currentSeasonNet,
      netPayable: netPayable > 0 ? netPayable : 0,
      loans,
      fees,
      payments: allPartialPaymentsForUser,
      // Pass the existing partial payment record (if any) to the frontend
      existingPartialPaymentForCurrentSeason:
        existingPartialPaymentForCurrentSeason
          ? {
              _id: existingPartialPaymentForCurrentSeason._id,
              amountRemainingToPay:
                existingPartialPaymentForCurrentSeason.amountRemainingToPay,
              // You can add other fields from this record if needed for display
            }
          : null,
    });
  } catch (error) {
    console.error("Error fetching payment summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};
