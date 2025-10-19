import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";
// import Cash from "../models/Cash.js";
import LoanTransaction from "../models/LoanTransaction.js";
import User from "../models/User.js";
import Season from "../models/Season.js";
import Production from "../models/Production.js";
import Plot from "../models/Plot.js";
import Sales from "../models/Sales.js";
import Stock from "../models/Stock.js";
import {
  getActiveSeasonForCooperative,
  getPreviousSeasonInfo,
} from "../services/seasonService.js";

// Helper: compute max loan based on recent yield, land size and average market price
const computeMaxLoanForMember = async (userId, cooperativeId, seasonId) => {
  console.log(`\n=== LOAN PREDICTION CALCULATION FOR MEMBER ${userId} ===`);

  // STEP 1: Determine which season's data to use for prediction
  let targetSeasonId = seasonId;
  let seasonUsed = "current season";
  if (!seasonId) {
    const prevSeasonInfo = getPreviousSeasonInfo();
    const prevSeason = await Season.findOne({
      cooperativeId,
      name: prevSeasonInfo.name,
      year: prevSeasonInfo.year,
    });
    targetSeasonId = prevSeason ? prevSeason._id : null;
    seasonUsed = prevSeason ? `${prevSeason.name} ${prevSeason.year}` : "no previous season found";
  }
  console.log(`📅 Using data from: ${seasonUsed}`);

  // STEP 2: Get member's land area
  const plots = await Plot.find({ userId });
  console.log(`🏞️  Found ${plots.length} plots for member:`);
  plots.forEach((plot, index) => {
    console.log(`   Plot ${index + 1}: ${plot.size} acres (UPI: ${plot.upi})`);
  });

  const totalLandArea = plots.reduce(
    (sum, p) => sum + (Number(p.size) || 0),
    0
  );
  console.log(`🏞️  Total land area: ${totalLandArea} acres`);

  if (totalLandArea <= 0) {
    console.log(`❌ No land area found - cannot provide loan`);
    return {
      expectedProductionKg: 0,
      expectedProductionValue: 0,
      maxLoan: 0,
      inputs: { totalLandArea, memberYieldPerAre: 0, avgPricePerKg: 0 },
    };
  }

  // STEP 3: Get member's recent production data
  const productionQuery = { userId };
  if (targetSeasonId) productionQuery.seasonId = targetSeasonId;
  const memberProductions = await Production.find(productionQuery).populate('productId', 'productName');

  console.log(`🌾 Member's production data (${memberProductions.length} records):`);
  const productYields = {};
  let totalMemberKg = 0;

  for (const prod of memberProductions) {
    const productId = String(prod.productId._id);
    const productName = prod.productId.productName;
    const quantity = Number(prod.quantity) || 0;
    totalMemberKg += quantity;

    console.log(`   - ${productName}: ${quantity} kg`);

    if (!productYields[productId]) {
      productYields[productId] = { totalKg: 0, count: 0, name: productName };
    }
    productYields[productId].totalKg += quantity;
    productYields[productId].count += 1;
  }

  console.log(`📊 Total production: ${totalMemberKg} kg across all products`);

  // STEP 4: Calculate yields per product
  const productAvgYields = {};
  for (const [productId, data] of Object.entries(productYields)) {
    productAvgYields[productId] = totalLandArea > 0 ? data.totalKg / totalLandArea : 0;
    console.log(`📈 ${data.name} yield: ${productAvgYields[productId].toFixed(2)} kg per acre`);
  }

  // STEP 5: Get overall yield (with fallback to cooperative average)
  let memberYieldPerAre = totalLandArea > 0 ? totalMemberKg / totalLandArea : 0;
  console.log(`🌱 Overall yield: ${memberYieldPerAre.toFixed(2)} kg per acre`);

  if (memberYieldPerAre <= 0) {
    console.log(`⚠️  No member production data - using cooperative average (reduced by 30% for safety)`);
    // Fallback: cooperative average yield over recent productions
    const coopProdQuery = { cooperativeId };
    if (targetSeasonId) coopProdQuery.seasonId = targetSeasonId;
    const coopProductions = await Production.find(coopProdQuery);

    // Approximate land contributing: sum of plot sizes of producers who produced
    const producerUserIds = [
      ...new Set(coopProductions.map((p) => String(p.userId))),
    ];
    const coopPlots = await Plot.find({
      cooperativeId,
      userId: { $in: producerUserIds },
    });
    const coopLand = coopPlots.reduce((s, p) => s + (Number(p.size) || 0), 0);
    const coopKg = coopProductions.reduce(
      (s, p) => s + (Number(p.quantity) || 0),
      0
    );
    const coopYield = coopLand > 0 ? coopKg / coopLand : 0;
    memberYieldPerAre = coopYield * 0.7; // Reduce by 30% for safety
    console.log(`   Cooperative average yield: ${coopYield.toFixed(2)} kg/acre`);
    console.log(`   Conservative member yield: ${memberYieldPerAre.toFixed(2)} kg/acre`);
  }

  // STEP 6: Get market prices from recent sales
  const salesQuery = { cooperativeId };
  if (targetSeasonId) salesQuery.seasonId = targetSeasonId;
  const sales = await Sales.find(salesQuery);

  console.log(`💰 Analyzing ${sales.length} sales records for pricing...`);

  // Calculate product-specific average prices
  const productPrices = {};
  let totalSalesQty = 0;
  let totalSalesValue = 0;

  for (const sale of sales) {
    const stock = await Stock.findById(sale.stockId).populate("productId");
    if (stock && stock.productId) {
      const productId = String(stock.productId._id);
      const productName = stock.productId.productName;
      const quantity = Number(sale.quantity) || 0;
      const unitPrice = Number(sale.unitPrice) || 0;

      totalSalesQty += quantity;
      totalSalesValue += quantity * unitPrice;

      if (!productPrices[productId]) {
        productPrices[productId] = { totalQty: 0, totalValue: 0, name: productName };
      }
      productPrices[productId].totalQty += quantity;
      productPrices[productId].totalValue += quantity * unitPrice;
    }
  }

  // Calculate average prices per product
  const productAvgPrices = {};
  for (const [productId, data] of Object.entries(productPrices)) {
    productAvgPrices[productId] = data.totalQty > 0 ? data.totalValue / data.totalQty : 0;
    console.log(`💵 ${data.name} average price: ${productAvgPrices[productId].toFixed(0)} RWF/kg`);
  }

  const avgPricePerKg = totalSalesQty > 0 ? totalSalesValue / totalSalesQty : 0;

  if (avgPricePerKg <= 0) {
    console.log(`⚠️  No sales data found - using conservative default price: 500 RWF/kg`);
    avgPricePerKg = 500; // Conservative default price per kg in RWF
  } else {
    console.log(`💵 Overall average market price: ${avgPricePerKg.toFixed(0)} RWF/kg`);
  }

  // STEP 7: Calculate expected production for next season
  console.log(`\n🔮 PREDICTION CALCULATION:`);

  let expectedProductionValue = 0;
  const expectedProductionKg = memberYieldPerAre * totalLandArea;

  console.log(`   Land area: ${totalLandArea} acres`);
  console.log(`   Expected yield: ${memberYieldPerAre.toFixed(2)} kg/acre`);
  console.log(`   Expected total production: ${expectedProductionKg.toFixed(0)} kg`);

  // Calculate value using product-specific yields and prices
  for (const [productId, yieldPerAre] of Object.entries(productAvgYields)) {
    const pricePerKg = productAvgPrices[productId] || avgPricePerKg;
    const expectedKg = yieldPerAre * totalLandArea;
    const productValue = expectedKg * pricePerKg;
    expectedProductionValue += productValue;
    console.log(`   ${productYields[productId].name}: ${expectedKg.toFixed(0)} kg × ${pricePerKg.toFixed(0)} RWF = ${productValue.toFixed(0)} RWF`);
  }

  // If no product-specific data, fall back to overall calculation
  if (expectedProductionValue === 0) {
    expectedProductionValue = expectedProductionKg * avgPricePerKg;
    console.log(`   Overall: ${expectedProductionKg.toFixed(0)} kg × ${avgPricePerKg.toFixed(0)} RWF/kg = ${expectedProductionValue.toFixed(0)} RWF`);
  }

  console.log(`💰 Expected production value: ${expectedProductionValue.toFixed(0)} RWF`);

  // STEP 8: Calculate maximum loan (50% of expected production value)
  const maxLoanBeforeExisting = 0.5 * expectedProductionValue;
  console.log(`🏦 Maximum loan (50% of production value): ${maxLoanBeforeExisting.toFixed(0)} RWF`);

  // STEP 9: Check existing loans in current season
  const currentSeason = await getActiveSeasonForCooperative(cooperativeId);
  let existingLoanAmount = 0;

  if (currentSeason) {
    const existingLoans = await Loan.find({
      userId,
      seasonId: currentSeason._id,
      cooperativeId,
      status: { $in: ['pending', 'approved'] } // Only count active loans
    });

    existingLoanAmount = existingLoans.reduce((sum, loan) => sum + (Number(loan.amountOwed) || 0), 0);
    console.log(`📋 Existing loans in ${currentSeason.name} ${currentSeason.year}: ${existingLoanAmount.toFixed(0)} RWF`);
  } else {
    console.log(`📋 No current season found - no existing loans to consider`);
  }

  // STEP 10: Final loan limit (max loan minus existing loans)
  const finalMaxLoan = Math.max(0, maxLoanBeforeExisting - existingLoanAmount);
  console.log(`✅ Final maximum loan amount: ${finalMaxLoan.toFixed(0)} RWF`);
  console.log(`   (Max possible: ${maxLoanBeforeExisting.toFixed(0)} - Existing: ${existingLoanAmount.toFixed(0)} = ${finalMaxLoan.toFixed(0)})`);

  console.log(`=== END PREDICTION CALCULATION ===\n`);

  return {
    expectedProductionKg,
    expectedProductionValue,
    maxLoan: finalMaxLoan,
    inputs: {
      totalLandArea,
      memberYieldPerAre,
      avgPricePerKg,
      productYields: productAvgYields,
      productPrices: productAvgPrices,
      existingLoansInSeason: existingLoanAmount,
      seasonUsed: seasonUsed
    },
  };
};

// ... existing imports ...
// (e.g., from Loan.js, PurchaseInput.js, etc.)

// Helper: compute max loan based on recent yield, land size and average market price
// ... (The existing computeMaxLoanForMember function remains the same) ...

// **NEW CONTROLLER FUNCTION**
export const getLoanPrediction = async (req, res) => {
  const { userId, seasonId } = req.query; // Use query params for GET request
  const { cooperativeId, role } = req.user; // 1. Role-Based Access Control - Optional, but good practice

  if (role !== "manager") {
    return res.status(403).json({ message: "Access denied." });
  } // 2. Input Validation

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  try {
    // 3. Compute the prediction using the existing helper (will use last season if no seasonId provided)
    const prediction = await computeMaxLoanForMember(
      userId,
      cooperativeId,
      seasonId // seasonId can be optional, will default to last season
    );

    res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error("Error fetching loan prediction:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while predicting max loan.",
    });
  }
};

// ... existing createLoan function ...

export const createLoan = async (req, res) => {
  const { userId, amountOwed, interest } = req.body;
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
    // 3. Get the current active season for the cooperative
    const activeSeason = await getActiveSeasonForCooperative(cooperativeId);
    if (!activeSeason) {
      return res.status(404).json({
        message:
          "No active season found for your cooperative. Please contact an administrator.",
      });
    }
    const seasonId = activeSeason._id;

    // 4. Verify the borrower exists and belongs to the manager's cooperative
    const borrower = await User.findById(userId);
    if (
      !borrower ||
      borrower.cooperativeId.toString() !== cooperativeId.toString()
    ) {
      return res.status(404).json({
        message: "User not found or not a member of your cooperative.",
      });
    }

    // 5. Predict max allowable loan based on production capacity (using last season's data)
    const prediction = await computeMaxLoanForMember(
      userId,
      cooperativeId,
      null // Pass null to use last season's data for prediction
    );
    if (prediction && prediction.maxLoan !== undefined) {
      if (Number(amountOwed) > prediction.maxLoan) {
        return res.status(400).json({
          success: false,
          message: "Requested amount exceeds 50% of expected production value.",
          maxLoan: Math.floor(prediction.maxLoan),
          expectedProductionKg: Math.floor(prediction.expectedProductionKg),
          expectedProductionValue: Math.floor(
            prediction.expectedProductionValue
          ),
          inputs: prediction.inputs,
        });
      }
    }

    // 6. Calculate the total amount owed including interest
    const newAmountOwed = amountOwed * (1 + (Number(interest) || 0) / 100);

    // 7. Create the loan document with the current active season
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
      message: `New loan created successfully for ${activeSeason.name} ${activeSeason.year}.`,
      loan: newLoan,
      season: {
        id: activeSeason._id,
        name: activeSeason.name,
        year: activeSeason.year,
      },
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
