import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";
// import Cash from "../models/Cash.js";
import LoanTransaction from "../models/LoanTransaction.js";
import User from "../models/User.js";
import Season from "../models/Season.js";
import Production from "../models/Production.js";
import Plot from "../models/Plot.js";
import Sales from "../models/Sales.js";

// Helper: compute max loan based on recent yield, land size and average market price
const computeMaxLoanForMember = async (userId, cooperativeId, seasonId) => {
  // 1) Land area (sum of member plots)
  const plots = await Plot.find({ userId });
  const totalLandArea = plots.reduce((sum, p) => sum + (Number(p.size) || 0), 0);

  // 2) Member recent production (optionally by season)
  const productionQuery = { userId };
  if (seasonId) productionQuery.seasonId = seasonId;
  const memberProductions = await Production.find(productionQuery);
  const totalMemberKg = memberProductions.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  // Yield per are (fallback to cooperative average if member yield unavailable)
  let memberYieldPerAre = totalLandArea > 0 ? totalMemberKg / totalLandArea : 0;

  if (memberYieldPerAre <= 0) {
    // Fallback: cooperative average yield over recent productions (last season if provided)
    const coopProdQuery = { cooperativeId };
    if (seasonId) coopProdQuery.seasonId = seasonId;
    const coopProductions = await Production.find(coopProdQuery);

    // Approximate land contributing: sum of plot sizes of producers who produced
    const producerUserIds = [...new Set(coopProductions.map(p => String(p.userId)))];
    const coopPlots = await Plot.find({ cooperativeId, userId: { $in: producerUserIds } });
    const coopLand = coopPlots.reduce((s, p) => s + (Number(p.size) || 0), 0);
    const coopKg = coopProductions.reduce((s, p) => s + (Number(p.quantity) || 0), 0);
    memberYieldPerAre = coopLand > 0 ? coopKg / coopLand : 0;
  }

  // 3) Average market price per kg from recent sales (cooperative-wide)
  const salesQuery = { cooperativeId };
  if (seasonId) salesQuery.seasonId = seasonId;
  const sales = await Sales.find(salesQuery);
  const totalSalesQty = sales.reduce((s, sale) => s + (Number(sale.quantity) || 0), 0);
  const totalSalesValue = sales.reduce((s, sale) => s + (Number(sale.totalPrice) || 0), 0);
  const avgPricePerKg = totalSalesQty > 0 ? totalSalesValue / totalSalesQty : 0;

  // If we lack price signal, be conservative and set max loan to 0
  if (avgPricePerKg <= 0 || memberYieldPerAre <= 0 || totalLandArea <= 0) {
    return {
      expectedProductionKg: 0,
      expectedProductionValue: 0,
      maxLoan: 0,
      inputs: { totalLandArea, memberYieldPerAre, avgPricePerKg }
    };
  }

  const expectedProductionKg = memberYieldPerAre * totalLandArea;
  const expectedProductionValue = expectedProductionKg * avgPricePerKg;
  const maxLoan = 0.5 * expectedProductionValue;

  return {
    expectedProductionKg,
    expectedProductionValue,
    maxLoan,
    inputs: { totalLandArea, memberYieldPerAre, avgPricePerKg }
  };
};

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

    // 3b. Predict max allowable loan based on production capacity
    const prediction = await computeMaxLoanForMember(userId, cooperativeId, seasonId);
    if (prediction && prediction.maxLoan !== undefined) {
      if (Number(amountOwed) > prediction.maxLoan) {
        return res.status(400).json({
          success: false,
          message: "Requested amount exceeds 50% of expected production value.",
          maxLoan: Math.floor(prediction.maxLoan),
          expectedProductionKg: Math.floor(prediction.expectedProductionKg),
          expectedProductionValue: Math.floor(prediction.expectedProductionValue),
          inputs: prediction.inputs,
        });
      }
    }

    // 1. Corrected the interest calculation to include the principal amount
    const newAmountOwed = amountOwed * (1 + (Number(interest) || 0) / 100);

    // 4. Create the loan document
    const newLoan = new Loan({
      userId,
      seasonId,
      loanOwed: amountOwed,
      amountOwed: newAmountOwed,
      interest,
      cooperativeId,
      status: "pending",
    });

    await newLoan.save();

    res.status(201).json({
      success: true,
      message: "New loan created successfully.",
      loan: newLoan,
      prediction,
    });
  } catch (error) {
    console.error("Error creating new loan:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

export const getAllLoans = async (req, res) => {
  const { role, cooperativeId } = req.user;

  if (role !== "manager" && role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only managers can view all loans." });
  }

  try {
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
      .populate("seasonId", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
    const loan = await Loan.findOne({ _id: id, cooperativeId });
    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found in your cooperative." });
    }

    if (userId) {
      const newMember = await User.findOne({ _id: userId, cooperativeId });
      if (!newMember) {
        return res
          .status(400)
          .json({ message: "The new member is not part of this cooperative." });
      }
      loan.userId = userId;
    }

    if (seasonId) {
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

      // const cash = await Cash.findOne({ cooperativeId });
      // if (!cash) {
      //   return res
      //     .status(404)
      //     .json({ message: "Cash record not found for this cooperative." });
      // }
      // cash.amount += amountToPay;
      // await cash.save();

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
