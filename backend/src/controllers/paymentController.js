// Revised Payment Controller (Clean, Correct)

import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Loan from "../models/Loan.js";
import Fee from "../models/Fees.js";
import CooperativeCash from "../models/Cash.js";
import PurchaseInput from "../models/PurchaseInput.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

export const processMemberPayment = async (req, res) => {
  const { userId, amountPaid } = req.body;

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

  try {
    // 1. Fetch unpaid productions
    const productions = await Production.find({
      userId,
      paymentStatus: "pending",
    });

    const grossAmount = productions.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    );

    // 2. Fetch unpaid fees
    const unpaidFees = await Fee.find({
      userId,
      status: { $ne: "paid" },
    });

    const totalFeesOutstanding = unpaidFees.reduce(
      (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
      0
    );

    // 3. Fetch unpaid loans
    const purchaseInputs = await PurchaseInput.find({ userId });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);

    const unpaidLoans = await Loan.find({
      purchaseInputId: { $in: purchaseInputIds },
      status: "pending",
    });

    const totalLoansOutstanding = unpaidLoans.reduce(
      (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
      0
    );

    // 4. Fetch previous partial payments
    const partialPayments = await Payment.find({ userId, status: "partial" });
    const previousBalance = partialPayments.reduce(
      (sum, p) => sum + (p.amountRemainingToPay || 0),
      0
    );

    // 5. Calculate total amount due
    const totalDeductions = totalFeesOutstanding + totalLoansOutstanding;
    const amountDue = grossAmount - totalDeductions + previousBalance;

    if (paymentAmount > amountDue) {
      return res.status(400).json({
        message: `Amount paid (${paymentAmount}) exceeds amount due (${amountDue.toFixed(
          2
        )}).`,
      });
    }

    // 6. Update cooperative cash
    const coopCash = await CooperativeCash.findOne();
    if (!coopCash) {
      return res
        .status(500)
        .json({ message: "Cooperative cash record not found." });
    }

    coopCash.balance += paymentAmount;
    await coopCash.save();

    // 7. Handle payment record (create new or update existing)
    let paymentRecord = await Payment.findOne({
      userId,
      status: "partial",
    });

    if (paymentRecord) {
      // Update existing partial payment
      paymentRecord.amountPaid += paymentAmount;
      paymentRecord.amountRemainingToPay -= paymentAmount;
      if (paymentRecord.amountRemainingToPay < 0) {
        paymentRecord.amountRemainingToPay = 0;
      }

      paymentRecord.status =
        paymentRecord.amountRemainingToPay === 0 ? "paid" : "partial";

      if (!paymentRecord.transactions) paymentRecord.transactions = [];
      paymentRecord.transactions.push({
        date: new Date(),
        amount: paymentAmount,
      });

      await paymentRecord.save();
    } else {
      // Create new payment record
      paymentRecord = new Payment({
        userId,
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
    }

    // 8. Create payment transaction log
    await PaymentTransaction.create({
      userId,
      paymentId: paymentRecord._id,
      amountPaid: paymentAmount,
      amountRemainingToPay: paymentRecord.amountRemainingToPay,
      transactionDate: new Date(),
    });

    // 9. Update production status (only if there are productions)
    if (productions.length > 0) {
      await Production.updateMany(
        { userId, paymentStatus: "pending" },
        { $set: { paymentStatus: "paid" } }
      );
    }

    // 10. Distribute payment to unpaid fees
    let remaining = paymentAmount;
    for (const fee of unpaidFees) {
      const feeBalance = fee.amountOwed - (fee.amountPaid || 0);
      const apply = Math.min(remaining, feeBalance);

      if (apply > 0) {
        fee.amountPaid = (fee.amountPaid || 0) + apply;
        fee.status = fee.amountPaid >= fee.amountOwed ? "paid" : "partial";
        if (fee.status === "paid") fee.paidAt = new Date();
        await fee.save();
        remaining -= apply;
        if (remaining <= 0) break;
      }
    }

    // 11. Distribute to unpaid loans
    if (remaining > 0) {
      for (const loan of unpaidLoans) {
        const loanBalance = loan.amountOwed - (loan.amountPaid || 0);
        const apply = Math.min(remaining, loanBalance);

        if (apply > 0) {
          loan.amountPaid = (loan.amountPaid || 0) + apply;
          if (loan.amountPaid >= loan.amountOwed) loan.status = "repaid";
          await loan.save();
          remaining -= apply;
          if (remaining <= 0) break;
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
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const processMemberPayment = async (req, res) => {
//   const { userId, seasonId, amountPaid } = req.body;

//   if (!userId || !seasonId || amountPaid === undefined || amountPaid === null) {
//     return res
//       .status(400)
//       .json({ message: "userId, seasonId, and amountPaid are required" });
//   }

//   const paymentAmount = parseFloat(amountPaid);
//   if (isNaN(paymentAmount) || paymentAmount <= 0) {
//     return res
//       .status(400)
//       .json({ message: "Amount paid must be a positive number." });
//   }

//   try {
//     // Fetch productions for user and season to calculate gross earnings
//     const productions = await Production.find({ userId, seasonId });
//     if (!productions || productions.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No productions found for this user in the season." });
//     }
//     const grossAmount = productions.reduce(
//       (sum, p) => sum + (p.totalPrice || 0),
//       0
//     );

//     // Calculate unpaid fees for user in the season
//     const unpaidFees = await Fee.find({
//       userId,
//       seasonId,
//       status: { $ne: "paid" },
//     });
//     const totalFeesOutstanding = unpaidFees.reduce(
//       (acc, fee) => acc + (fee.amountOwed - (fee.amountPaid || 0)),
//       0
//     );

//     // Calculate unpaid loans for user in the season
//     const purchaseInputs = await PurchaseInput.find({ userId, seasonId });
//     const purchaseInputIds = purchaseInputs.map((p) => p._id);
//     const unpaidLoans = await Loan.find({
//       purchaseInputId: { $in: purchaseInputIds },
//       status: "pending",
//     });
//     const totalLoansOutstanding = unpaidLoans.reduce(
//       (acc, loan) => acc + (loan.amountOwed - (loan.amountPaid || 0)),
//       0
//     );

//     // Calculate previous partial payments for user across all seasons
//     const allPartialPayments = await Payment.find({
//       userId,
//       status: "partial",
//     });
//     const previousRemainingBalance = allPartialPayments.reduce(
//       (sum, p) => sum + (p.amountRemainingToPay || 0),
//       0
//     );

//     const totalDeductions = totalFeesOutstanding + totalLoansOutstanding;
//     const amountDue = grossAmount - totalDeductions + previousRemainingBalance;

//     if (paymentAmount > amountDue) {
//       return res.status(400).json({
//         message: `Amount paid (${paymentAmount}) exceeds amount due (${amountDue.toFixed(
//           2
//         )}).`,
//       });
//     }

//     // Update cooperative cash balance
//     const coopCash = await CooperativeCash.findOne();
//     if (!coopCash) {
//       return res
//         .status(500)
//         .json({ message: "Cooperative cash record not found." });
//     }

//     coopCash.balance += paymentAmount;
//     await coopCash.save();

//     // Find existing payment for user and season
//     let paymentRecord = await Payment.findOne({ userId, seasonId });
//     if (paymentRecord) {
//       paymentRecord.amountPaid += paymentAmount;
//       paymentRecord.amountRemainingToPay -= paymentAmount;

//       if (paymentRecord.amountRemainingToPay < 0)
//         paymentRecord.amountRemainingToPay = 0;
//       paymentRecord.status =
//         paymentRecord.amountRemainingToPay === 0 ? "paid" : "partial";

//       if (!paymentRecord.transactions) paymentRecord.transactions = [];
//       paymentRecord.transactions.push({
//         date: new Date(),
//         amount: paymentAmount,
//       });
//       await paymentRecord.save();

//       // ✅ NEW: Record transaction
//       await PaymentTransaction.create({
//         userId,
//         seasonId,
//         paymentId: paymentRecord._id,
//         amountPaid: paymentAmount,
//         amountRemainingToPay: paymentRecord.amountRemainingToPay,
//         transactionDate: new Date(),
//       });
//     } else {
//       // Create new payment record
//       paymentRecord = new Payment({
//         userId,
//         seasonId,
//         grossAmount,
//         totalDeductions,
//         amountDue,
//         amountPaid: paymentAmount,
//         amountRemainingToPay: amountDue - paymentAmount,
//         status: amountDue - paymentAmount === 0 ? "paid" : "partial",
//         transactions: [
//           {
//             date: new Date(),
//             amount: paymentAmount,
//           },
//         ],
//       });

//       await paymentRecord.save();

//       await PaymentTransaction.create({
//         userId,
//         seasonId,
//         paymentId: paymentRecord._id,
//         amountPaid: paymentAmount,
//         amountRemainingToPay: paymentRecord.amountRemainingToPay,
//         transactionDate: new Date(),
//       });
//     }

//     // Distribute payment to unpaid fees
//     let remainingPayment = paymentAmount;
//     for (const fee of unpaidFees) {
//       const feeRemaining = fee.amountOwed - (fee.amountPaid || 0);
//       const applyAmount = Math.min(remainingPayment, feeRemaining);
//       if (applyAmount > 0) {
//         fee.amountPaid = (fee.amountPaid || 0) + applyAmount;
//         fee.status = fee.amountPaid >= fee.amountOwed ? "paid" : "partial";
//         if (fee.status === "paid") fee.paidAt = new Date();
//         await fee.save();
//         remainingPayment -= applyAmount;
//         if (remainingPayment <= 0) break;
//       }
//     }

//     // Distribute remaining payment to unpaid loans
//     if (remainingPayment > 0) {
//       for (const loan of unpaidLoans) {
//         const loanRemaining = loan.amountOwed - (loan.amountPaid || 0);
//         const applyAmount = Math.min(remainingPayment, loanRemaining);
//         if (applyAmount > 0) {
//           loan.amountPaid = (loan.amountPaid || 0) + applyAmount;
//           if (loan.amountPaid >= loan.amountOwed) loan.status = "repaid";
//           await loan.save();
//           remainingPayment -= applyAmount;
//           if (remainingPayment <= 0) break;
//         }
//       }
//     }

//     return res.status(200).json({
//       message: "Payment processed successfully",
//       payment: paymentRecord,
//       coopCashBalance: coopCash.balance,
//     });
//   } catch (error) {
//     console.error("Error processing member payment:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// In your backend controller (e.g., controllers/paymentController.js)

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).populate("userId", "names"); // Populate only userId with names

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
// export const getPaymentSummary = async (req, res) => {
//   const { userId, seasonId } = req.query;

//   if (!userId || !seasonId) {
//     return res
//       .status(400)
//       .json({ message: "userId and seasonId are required" });
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
//     const totalLoans = loans.reduce(
//       (sum, loan) => sum + (loan.amountOwed - (loan.amountPaid || 0)),
//       0
//     );

//     const fees = await Fee.find({ userId, seasonId, status: { $ne: "paid" } });
//     const totalUnpaidFees = fees.reduce(
//       (sum, fee) => sum + (fee.amountOwed - (fee.amountPaid || 0)),
//       0
//     );

//     const allPartialPaymentsForUser = await Payment.find({
//       userId,
//       status: "partial",
//     });
//     const previousRemaining = allPartialPaymentsForUser.reduce(
//       (sum, p) => sum + (p.amountRemainingToPay || 0),
//       0
//     );

//     const currentSeasonDeductions = totalLoans + totalUnpaidFees;
//     const currentSeasonNet = totalProduction - currentSeasonDeductions;

//     const netPayable = currentSeasonNet + previousRemaining;

//     // --- NEW LOGIC FOR EXISTING PARTIAL PAYMENT FOR CURRENT SEASON ---
//     const existingPartialPaymentForCurrentSeason = await Payment.findOne({
//       userId,
//       seasonId,
//       status: "partial",
//     });
//     // --- END NEW LOGIC ---

//     res.status(200).json({
//       totalProduction,
//       totalLoans,
//       totalUnpaidFees,
//       previousRemaining,
//       currentSeasonNet,
//       netPayable: netPayable > 0 ? netPayable : 0,
//       loans,
//       fees,
//       payments: allPartialPaymentsForUser,
//       // Pass the existing partial payment record (if any) to the frontend
//       existingPartialPaymentForCurrentSeason:
//         existingPartialPaymentForCurrentSeason
//           ? {
//               _id: existingPartialPaymentForCurrentSeason._id,
//               amountRemainingToPay:
//                 existingPartialPaymentForCurrentSeason.amountRemainingToPay,
//               // You can add other fields from this record if needed for display
//             }
//           : null,
//     });
//   } catch (error) {
//     console.error("Error fetching payment summary:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getPaymentSummary = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    // ✅ Fetch ALL productions for the user
    const productions = await Production.find({
      userId,
      paymentStatus: "pending",
    });
    const totalProduction = productions.reduce(
      (sum, prod) => sum + (prod.totalPrice || 0),
      0
    );

    // ✅ Fetch ALL purchase inputs to find related loans
    const purchaseInputs = await PurchaseInput.find({ userId });
    const purchaseInputIds = purchaseInputs.map((p) => p._id);

    // ✅ Fetch ALL pending loans
    const loans = await Loan.find({
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
