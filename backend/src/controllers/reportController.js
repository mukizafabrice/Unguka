import mongoose from "mongoose";
import User from "../models/User.js";
import Cooperative from "../models/Cooperative.js";
import Season from "../models/Season.js";
import Fees from "../models/Fees.js";
import Loan from "../models/Loan.js";
import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Sales from "../models/Sales.js";
import PurchaseInput from "../models/PurchaseInput.js";
import PurchaseOut from "../models/PurchaseOut.js";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import Plot from "../models/Plot.js";
import FeeType from "../models/FeeType.js";

// Import docx for Word document generation
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from "docx";

// Manager Report - All cooperative data
export const getManagerReport = async (req, res) => {
  try {
    const { cooperativeId, seasonId } = req.query;

    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Valid cooperative ID is required",
      });
    }

    // Verify user has access to this cooperative
    if (req.user.role === "manager" && req.user.cooperativeId.toString() !== cooperativeId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this cooperative",
      });
    }

    // Get cooperative details
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({
        success: false,
        message: "Cooperative not found",
      });
    }

    // Build query filters based on seasonId
    const seasonFilter = seasonId && mongoose.Types.ObjectId.isValid(seasonId) ? { seasonId } : {};

    // Get all data for the cooperative
    const [
      users,
      seasons,
      feeTypes,
      fees,
      loans,
      payments,
      productions,
      sales,
      purchaseInputs,
      purchaseOuts,
      stocks,
      products,
      plots,
    ] = await Promise.all([
      User.find({ cooperativeId }).select("-password -passwordResetToken -passwordResetTokenExpire"),
      Season.find({ cooperativeId }).sort({ year: -1, name: -1 }),
      FeeType.find({ cooperativeId }),
      Fees.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("userId", "names").populate("feeTypeId", "name").populate("seasonId", "name year"),
      Loan.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("userId", "names").populate("seasonId", "name year"),
      Payment.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("userId", "names"),
      Production.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("userId", "names").populate("productId", "productName").populate("seasonId", "name year"),
      Sales.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("seasonId", "name year").populate("stockId"),
      PurchaseInput.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("userId", "names").populate("productId", "productName").populate("seasonId", "name year"),
      PurchaseOut.find(seasonId ? { cooperativeId, ...seasonFilter } : { cooperativeId }).populate("productId", "productName").populate("seasonId", "name year"),
      Stock.find({ cooperativeId }).populate("productId", "productName"),
      Product.find({ cooperativeId }),
      Plot.find({ cooperativeId }).populate("userId", "names"),
    ]);

    // Calculate summary statistics - only for selected season if specified
    const summary = {
      totalMembers: users.filter(u => u.role === "member").length,
      totalManagers: users.filter(u => u.role === "manager").length,
      totalSeasons: seasons.length,
      activeSeason: seasons.find(s => s.status === "active"),
      totalProducts: products.length,
      totalPlots: plots.length,

      // Financial summary - filtered by season if selected
      totalFeesOwed: fees.reduce((sum, fee) => sum + fee.amountOwed, 0),
      totalFeesPaid: fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
      totalLoansOwed: loans.reduce((sum, loan) => sum + loan.amountOwed, 0),
      totalPaymentsDue: payments.reduce((sum, payment) => sum + payment.amountDue, 0),
      totalPaymentsPaid: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),

      // Production & Sales - filtered by season if selected
      totalProductionValue: productions.reduce((sum, prod) => sum + prod.totalPrice, 0),
      totalSalesValue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      totalPurchaseInputs: purchaseInputs.reduce((sum, purchase) => sum + purchase.totalPrice, 0),
      totalPurchaseOuts: purchaseOuts.reduce((sum, purchase) => sum + purchase.totalPrice, 0),
      totalStockValue: stocks.reduce((sum, stock) => sum + stock.totalPrice, 0),

      // Status counts - filtered by season if selected
      feesPaid: fees.filter(f => f.status === "paid").length,
      feesPartial: fees.filter(f => f.status === "partial").length,
      feesUnpaid: fees.filter(f => f.status === "unpaid").length,

      loansRepaid: loans.filter(l => l.status === "repaid").length,
      loansPending: loans.filter(l => l.status === "pending").length,

      paymentsPaid: payments.filter(p => p.status === "paid").length,
      paymentsPartial: payments.filter(p => p.status === "partial").length,
      paymentsPending: payments.filter(p => p.status === "pending").length,
    };

    // Group data by seasons for seasonal analysis - show all seasons but filter data appropriately
    const seasonalData = seasons.map(season => {
      // If a specific season is selected, only show data for that season
      // Otherwise show all data grouped by season
      const seasonSpecificFees = seasonId
        ? fees.filter(f => f.seasonId?._id.toString() === season._id.toString())
        : fees.filter(f => f.seasonId?._id.toString() === season._id.toString());

      const seasonSpecificLoans = seasonId
        ? loans.filter(l => l.seasonId?._id.toString() === season._id.toString())
        : loans.filter(l => l.seasonId?._id.toString() === season._id.toString());

      const seasonSpecificProductions = seasonId
        ? productions.filter(p => p.seasonId?._id.toString() === season._id.toString())
        : productions.filter(p => p.seasonId?._id.toString() === season._id.toString());

      const seasonSpecificPurchaseInputs = seasonId
        ? purchaseInputs.filter(pi => pi.seasonId?._id.toString() === season._id.toString())
        : purchaseInputs.filter(pi => pi.seasonId?._id.toString() === season._id.toString());

      const seasonSpecificPurchaseOuts = seasonId
        ? purchaseOuts.filter(po => po.seasonId?._id.toString() === season._id.toString())
        : purchaseOuts.filter(po => po.seasonId?._id.toString() === season._id.toString());

      const seasonSpecificSales = seasonId
        ? sales.filter(s => s.seasonId?._id.toString() === season._id.toString())
        : sales.filter(s => s.seasonId?._id.toString() === season._id.toString());

      return {
        season: `${season.name} ${season.year}`,
        status: season.status,
        fees: seasonSpecificFees,
        loans: seasonSpecificLoans,
        productions: seasonSpecificProductions,
        purchaseInputs: seasonSpecificPurchaseInputs,
        purchaseOuts: seasonSpecificPurchaseOuts,
        sales: seasonSpecificSales,
      };
    });

    // Calculate production predictions (next season) based on available data and optional season filter
    const productionPredictions = calculateProductionPredictions(
      productions,
      plots,
      seasons,
      seasonId || null
    );

    res.status(200).json({
      success: true,
      message: "Manager report generated successfully",
      data: {
        cooperative,
        summary,
        details: {
          users,
          seasons,
          feeTypes,
          fees,
          loans,
          payments,
          productions,
          sales,
          purchaseInputs,
          purchaseOuts,
          stocks,
          products,
          plots,
        },
        seasonalAnalysis: seasonalData,
        productionPredictions: productionPredictions,
        generatedAt: new Date(),
        generatedBy: req.user.names,
      },
    });
  } catch (error) {
    console.error("Error generating manager report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating report",
    });
  }
};

// Member Report - Personal activity data
export const getMemberReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { seasonId } = req.query;

    // Get user details
    const user = await User.findById(userId).populate("cooperativeId");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const query = { userId };
    if (seasonId && mongoose.Types.ObjectId.isValid(seasonId)) {
      query.seasonId = seasonId;
    }

    // Get all personal data
    const [
      fees,
      loans,
      payments,
      productions,
      purchaseInputs,
      plots,
    ] = await Promise.all([
      Fees.find({ userId }).populate("feeTypeId", "name").populate("seasonId", "name year"),
      Loan.find({ userId }).populate("seasonId", "name year"),
      Payment.find({ userId }),
      Production.find(query).populate("productId", "productName").populate("seasonId", "name year"),
      PurchaseInput.find(query).populate("productId", "productName").populate("seasonId", "name year"),
      Plot.find({ userId }),
    ]);

    // Calculate personal summary
    const summary = {
      totalPlots: plots.length,
      totalPlotSize: plots.reduce((sum, plot) => sum + plot.size, 0),

      // Financial summary
      totalFeesOwed: fees.reduce((sum, fee) => sum + fee.amountOwed, 0),
      totalFeesPaid: fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
      totalLoansOwed: loans.reduce((sum, loan) => sum + loan.amountOwed, 0),
      totalPaymentsDue: payments.reduce((sum, payment) => sum + payment.amountDue, 0),
      totalPaymentsPaid: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),

      // Production & Purchases
      totalProductionValue: productions.reduce((sum, prod) => sum + prod.totalPrice, 0),
      totalPurchaseInputs: purchaseInputs.reduce((sum, purchase) => sum + purchase.totalPrice, 0),

      // Status counts
      feesPaid: fees.filter(f => f.status === "paid").length,
      feesPartial: fees.filter(f => f.status === "partial").length,
      feesUnpaid: fees.filter(f => f.status === "unpaid").length,

      loansRepaid: loans.filter(l => l.status === "repaid").length,
      loansPending: loans.filter(l => l.status === "pending").length,

      paymentsPaid: payments.filter(p => p.status === "paid").length,
      paymentsPartial: payments.filter(p => p.status === "partial").length,
      paymentsPending: payments.filter(p => p.status === "pending").length,
    };

    // Group by seasons
    const seasons = await Season.find({ cooperativeId: user.cooperativeId }).sort({ year: -1, name: -1 });
    const seasonalData = seasons.map(season => ({
      season: `${season.name} ${season.year}`,
      status: season.status,
      fees: fees.filter(f => f.seasonId?._id.toString() === season._id.toString()),
      loans: loans.filter(l => l.seasonId?._id.toString() === season._id.toString()),
      productions: productions.filter(p => p.seasonId?._id.toString() === season._id.toString()),
      purchaseInputs: purchaseInputs.filter(pi => pi.seasonId?._id.toString() === season._id.toString()),
    }));

    // Compute member production predictions with safe defaults
    let productionPredictions = {
      currentMetrics: {
        memberPlotSize: 0,
        memberProductionKg: 0,
        memberYieldPerAre: 0,
        memberProductionValue: 0,
      },
      cooperativeComparison: {
        cooperativeAverageYield: 0,
        historicalSeasonsCount: 0,
      },
      predictions: {
        method: 'none',
        predictedYieldPerAre: 0,
        predictedTotalProduction: 0,
        confidenceLevel: 'N/A',
        assumptions: [],
      },
    };

    try {
      const calc = await calculateMemberProductionPredictions(
        productions,
        plots,
        user.cooperativeId,
        seasonId || null
      );
      if (calc) productionPredictions = calc;
    } catch (err) {
      console.error('Error calculating member predictions:', err);
    }

    res.status(200).json({
      success: true,
      message: "Member report generated successfully",
      data: {
        user: {
          names: user.names,
          email: user.email,
          phoneNumber: user.phoneNumber,
          nationalId: user.nationalId,
          role: user.role,
          cooperative: user.cooperativeId,
        },
        summary,
        details: {
          fees,
          loans,
          payments,
          productions,
          purchaseInputs,
          plots,
        },
        seasonalAnalysis: seasonalData,
        productionPredictions: productionPredictions,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error generating member report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating report",
    });
  }
};

// Generate Word document for Manager Report
export const downloadManagerReportWord = async (req, res) => {
  try {
    const { cooperativeId, seasonId } = req.query;

    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Valid cooperative ID is required",
      });
    }

    // Verify user has access to this cooperative
    if (req.user.role === "manager" && req.user.cooperativeId.toString() !== cooperativeId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this cooperative",
      });
    }

    // Get cooperative details
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({
        success: false,
        message: "Cooperative not found",
      });
    }

    // Get all data for the cooperative (same as getManagerReport)
    const [
      users,
      seasons,
      feeTypes,
      fees,
      loans,
      payments,
      productions,
      sales,
      purchaseInputs,
      purchaseOuts,
      stocks,
      products,
      plots,
    ] = await Promise.all([
      User.find({ cooperativeId }).select("-password -passwordResetToken -passwordResetTokenExpire"),
      Season.find({ cooperativeId }).sort({ year: -1, name: -1 }),
      FeeType.find({ cooperativeId }),
      Fees.find({ cooperativeId }).populate("userId", "names").populate("feeTypeId", "name").populate("seasonId", "name year"),
      Loan.find({ cooperativeId }).populate("userId", "names").populate("seasonId", "name year"),
      Payment.find({ cooperativeId }).populate("userId", "names"),
      Production.find({ cooperativeId }).populate("userId", "names").populate("productId", "productName").populate("seasonId", "name year"),
      Sales.find({ cooperativeId }).populate("seasonId", "name year").populate("stockId"),
      PurchaseInput.find({ cooperativeId }).populate("userId", "names").populate("productId", "productName").populate("seasonId", "name year"),
      PurchaseOut.find({ cooperativeId }).populate("productId", "productName").populate("seasonId", "name year"),
      Stock.find({ cooperativeId }).populate("productId", "productName"),
      Product.find({ cooperativeId }),
      Plot.find({ cooperativeId }).populate("userId", "names"),
    ]);

    // Calculate summary statistics
    const summary = {
      totalMembers: users.filter(u => u.role === "member").length,
      totalManagers: users.filter(u => u.role === "manager").length,
      totalSeasons: seasons.length,
      activeSeason: seasons.find(s => s.status === "active"),
      totalProducts: products.length,
      totalPlots: plots.length,
      totalFeesOwed: fees.reduce((sum, fee) => sum + fee.amountOwed, 0),
      totalFeesPaid: fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
      totalLoansOwed: loans.reduce((sum, loan) => sum + loan.amountOwed, 0),
      totalPaymentsDue: payments.reduce((sum, payment) => sum + payment.amountDue, 0),
      totalPaymentsPaid: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
      totalProductionValue: productions.reduce((sum, prod) => sum + prod.totalPrice, 0),
      totalSalesValue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      totalPurchaseInputs: purchaseInputs.reduce((sum, purchase) => sum + purchase.totalPrice, 0),
      totalPurchaseOuts: purchaseOuts.reduce((sum, purchase) => sum + purchase.totalPrice, 0),
      totalStockValue: stocks.reduce((sum, stock) => sum + stock.totalPrice, 0),
      feesPaid: fees.filter(f => f.status === "paid").length,
      feesPartial: fees.filter(f => f.status === "partial").length,
      feesUnpaid: fees.filter(f => f.status === "unpaid").length,
      loansRepaid: loans.filter(l => l.status === "repaid").length,
      loansPending: loans.filter(l => l.status === "pending").length,
      paymentsPaid: payments.filter(p => p.status === "paid").length,
      paymentsPartial: payments.filter(p => p.status === "partial").length,
      paymentsPending: payments.filter(p => p.status === "pending").length,
    };

    // Calculate production predictions based on historical data
    const productionPredictions = {
      currentMetrics: {
        totalLandArea: 0,
        totalProductionKg: 0,
        yieldPerAre: 0,
        totalProductionValue: 0,
      },
      historicalAnalysis: {
        seasonsAnalyzed: 0,
        averageHistoricalYield: 0,
      },
      predictions: {
        method: 'none',
        predictedYieldPerAre: 0,
        predictedTotalProduction: 0,
        confidenceLevel: 'N/A',
        assumptions: ['Error calculating predictions']
      }
    };

    try {
      const calculatedPredictions = await calculateProductionPredictions(productions, plots, seasons, seasonId || null);
      Object.assign(productionPredictions, calculatedPredictions);
    } catch (error) {
      console.error('Error calculating production predictions:', error);
      // productionPredictions already has fallback values
    }

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "COOPERATIVE MANAGEMENT REPORT",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${cooperative.name} - ${cooperative.registrationNumber}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Report Info
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: `Generated by: ${req.user.names}`,
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
          }),

          // Executive Summary
          new Paragraph({
            text: "EXECUTIVE SUMMARY",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          // Summary Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Metric")] }),
                  new TableCell({ children: [new Paragraph("Value")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Members")] }),
                  new TableCell({ children: [new Paragraph(summary.totalMembers.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Managers")] }),
                  new TableCell({ children: [new Paragraph(summary.totalManagers.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Active Season")] }),
                  new TableCell({ children: [new Paragraph(summary.activeSeason ? `${summary.activeSeason.name} ${summary.activeSeason.year}` : 'None')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Products")] }),
                  new TableCell({ children: [new Paragraph(summary.totalProducts.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Plots")] }),
                  new TableCell({ children: [new Paragraph(summary.totalPlots.toString())] }),
                ],
              }),
            ],
          }),

          // Financial Overview
          new Paragraph({
            text: "FINANCIAL OVERVIEW",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Financial Metric")] }),
                  new TableCell({ children: [new Paragraph("Amount (RWF)")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Fees Collected")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalFeesPaid))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Outstanding Fees")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalFeesOwed - summary.totalFeesPaid))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Production Value")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalProductionValue))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Sales Revenue")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalSalesValue))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Stock Value")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalStockValue))] }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({
            text: "This report was generated by the Unguka Cooperative Management System",
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
        ],
      }],
    });

    // Generate and send the document
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=cooperative-report-${cooperative.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`);
    res.send(buffer);

  } catch (error) {
    console.error("Error generating Word report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating Word report",
    });
  }
};

// Generate Word document for Member Report
export const downloadMemberReportWord = async (req, res) => {
  try {
    const userId = req.user._id;
    const { seasonId } = req.query;

    // Get user details
    const user = await User.findById(userId).populate("cooperativeId");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const query = { userId };
    if (seasonId && mongoose.Types.ObjectId.isValid(seasonId)) {
      query.seasonId = seasonId;
    }

    // Get all personal data
    const [
      fees,
      loans,
      payments,
      productions,
      purchaseInputs,
      plots,
    ] = await Promise.all([
      Fees.find({ userId }).populate("feeTypeId", "name").populate("seasonId", "name year"),
      Loan.find({ userId }).populate("seasonId", "name year"),
      Payment.find({ userId }),
      Production.find(query).populate("productId", "productName").populate("seasonId", "name year"),
      PurchaseInput.find(query).populate("productId", "productName").populate("seasonId", "name year"),
      Plot.find({ userId }),
    ]);

    // Calculate personal summary
    const summary = {
      totalPlots: plots.length,
      totalPlotSize: plots.reduce((sum, plot) => sum + plot.size, 0),
      totalFeesOwed: fees.reduce((sum, fee) => sum + fee.amountOwed, 0),
      totalFeesPaid: fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
      totalLoansOwed: loans.reduce((sum, loan) => sum + loan.amountOwed, 0),
      totalPaymentsDue: payments.reduce((sum, payment) => sum + payment.amountDue, 0),
      totalPaymentsPaid: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
      totalProductionValue: productions.reduce((sum, prod) => sum + prod.totalPrice, 0),
      totalPurchaseInputs: purchaseInputs.reduce((sum, purchase) => sum + purchase.totalPrice, 0),
      feesPaid: fees.filter(f => f.status === "paid").length,
      feesPartial: fees.filter(f => f.status === "partial").length,
      feesUnpaid: fees.filter(f => f.status === "unpaid").length,
      loansRepaid: loans.filter(l => l.status === "repaid").length,
      loansPending: loans.filter(l => l.status === "pending").length,
      paymentsPaid: payments.filter(p => p.status === "paid").length,
      paymentsPartial: payments.filter(p => p.status === "partial").length,
      paymentsPending: payments.filter(p => p.status === "pending").length,
    };

    // Calculate production predic  tions for member
    const productionPredictions = {
      currentMetrics: {
        memberPlotSize: 0,
        memberProductionKg: 0,
        memberYieldPerAre: 0,
        memberProductionValue: 0,
      },
      cooperativeComparison: {
        cooperativeAverageYield: 0,
        historicalSeasonsCount: 0,
      },
      predictions: {
        method: 'none',
        predictedYieldPerAre: 0,
        predictedTotalProduction: 0,
        confidenceLevel: 'N/A',
        assumptions: ['Error calculating predictions']
      }
    };

    try {
      const calculatedPredictions = await calculateMemberProductionPredictions(productions, plots, user.cooperativeId, seasonId);
      Object.assign(productionPredictions, calculatedPredictions);
    } catch (error) {
      console.error('Error calculating member production predictions:', error);
      // productionPredictions already has fallback values
    }

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "MEMBER ACTIVITY REPORT",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${user.names} - ${user.cooperativeId.name}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Report Info
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: `Member ID: ${user.nationalId}`,
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
          }),

          // Personal Summary
          new Paragraph({
            text: "PERSONAL SUMMARY",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Metric")] }),
                  new TableCell({ children: [new Paragraph("Value")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Land Plots")] }),
                  new TableCell({ children: [new Paragraph(summary.totalPlots.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Plot Size")] }),
                  new TableCell({ children: [new Paragraph(`${summary.totalPlotSize.toFixed(2)} acres`)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Production Records")] }),
                  new TableCell({ children: [new Paragraph(productions.length.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Purchase Inputs")] }),
                  new TableCell({ children: [new Paragraph(purchaseInputs.length.toString())] }),
                ],
              }),
            ],
          }),

          // Financial Overview
          new Paragraph({
            text: "FINANCIAL OVERVIEW",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Financial Metric")] }),
                  new TableCell({ children: [new Paragraph("Amount (RWF)")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Fees Paid")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalFeesPaid))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Outstanding Fees")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalFeesOwed - summary.totalFeesPaid))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Production Value")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalProductionValue))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Input Purchases")] }),
                  new TableCell({ children: [new Paragraph(formatCurrency(summary.totalPurchaseInputs))] }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({
            text: "This report was generated by the Unguka Cooperative Management System",
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
        ],
      }],
    });

    // Generate and send the document
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=member-report-${user.names.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`);
    res.send(buffer);

  } catch (error) {
    console.error("Error generating Word report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating Word report",
    });
  }
};

// Helper function to calculate production predictions for cooperative
const calculateProductionPredictions = async (productions, plots, seasons, cooperativeId, selectedSeasonId) => {
  try {
    // Get total land area
    const totalLandArea = plots.reduce((sum, plot) => sum + plot.size, 0);

    // Calculate current season production (if selected) or overall production
    const relevantProductions = selectedSeasonId
      ? productions.filter(p => p.seasonId && p.seasonId.toString() === selectedSeasonId.toString())
      : productions;

    const totalProductionKg = relevantProductions.reduce((sum, prod) => sum + prod.quantity, 0);
    const totalProductionValue = relevantProductions.reduce((sum, prod) => sum + prod.totalPrice, 0);

    // Calculate yield per unit area
    const yieldPerAre = totalLandArea > 0 ? totalProductionKg / totalLandArea : 0;

    // Get historical data from previous seasons for prediction
    const historicalSeasons = seasons
      .filter(s => s.year < new Date().getFullYear() || (s.year === new Date().getFullYear() && s.name === 'Season-A'))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.name.localeCompare(a.name);
      })
      .slice(0, 3); // Get last 3 seasons

    // Calculate average historical yield
    let historicalAverageYield = 0;
    let historicalSeasonsCount = 0;

    for (const season of historicalSeasons) {
      const seasonProductions = productions.filter(p =>
        p.seasonId && p.seasonId.toString() === season._id.toString()
      );
      const seasonProduction = seasonProductions.reduce((sum, prod) => sum + prod.quantity, 0);
      const seasonPlots = plots.filter(p =>
        seasonProductions.some(prod => prod.userId.toString() === p.userId.toString())
      );
      const seasonLandArea = seasonPlots.reduce((sum, plot) => sum + plot.size, 0);

      if (seasonLandArea > 0) {
        const seasonYield = seasonProduction / seasonLandArea;
        historicalAverageYield += seasonYield;
        historicalSeasonsCount++;
      }
    }

    historicalAverageYield = historicalSeasonsCount > 0 ? historicalAverageYield / historicalSeasonsCount : 0;

    // Predict next season production
    const predictionMethod = historicalAverageYield > 0 ? 'historical' : 'current';
    const baseYield = historicalAverageYield > 0 ? historicalAverageYield : yieldPerAre;

    // Apply growth factor (assume 5% improvement)
    const growthFactor = 1.05;
    const predictedYieldPerAre = baseYield * growthFactor;

    const predictedTotalProduction = totalLandArea * predictedYieldPerAre;

    // Calculate confidence level
    const confidenceLevel = historicalSeasonsCount >= 2 ? 'High' :
                           historicalSeasonsCount >= 1 ? 'Medium' : 'Low';

    return {
      currentMetrics: {
        totalLandArea,
        totalProductionKg,
        yieldPerAre,
        totalProductionValue,
      },
      historicalAnalysis: {
        seasonsAnalyzed: historicalSeasonsCount,
        averageHistoricalYield: historicalAverageYield,
      },
      predictions: {
        method: predictionMethod,
        predictedYieldPerAre,
        predictedTotalProduction,
        confidenceLevel,
        assumptions: [
          '5% annual improvement factor applied',
          `${historicalSeasonsCount} historical seasons analyzed`,
          'Based on current land allocation'
        ]
      }
    };
  } catch (error) {
    console.error('Error calculating production predictions:', error);
    return {
      currentMetrics: {
        totalLandArea: 0,
        totalProductionKg: 0,
        yieldPerAre: 0,
        totalProductionValue: 0,
      },
      historicalAnalysis: {
        seasonsAnalyzed: 0,
        averageHistoricalYield: 0,
      },
      predictions: {
        method: 'none',
        predictedYieldPerAre: 0,
        predictedTotalProduction: 0,
        confidenceLevel: 'N/A',
        assumptions: ['Insufficient data for predictions']
      }
    };
  }
};

// Helper function to calculate production predictions for member
const calculateMemberProductionPredictions = async (productions, plots, cooperativeId, selectedSeasonId) => {
  try {
    // Get cooperative-wide historical data for better predictions
    const allProductions = await Production.find({ cooperativeId }).populate('seasonId').populate('userId');
    const allPlots = await Plot.find({ cooperativeId }).populate('userId');
    const seasons = await Season.find({ cooperativeId }).sort({ year: -1, name: -1 });

    // Member's specific data
    const memberPlotSize = plots.reduce((sum, plot) => sum + plot.size, 0);
    const memberProductionKg = productions.reduce((sum, prod) => sum + prod.quantity, 0);
    const memberProductionValue = productions.reduce((sum, prod) => sum + prod.totalPrice, 0);

    // Calculate member's yield per area
    const memberYieldPerAre = memberPlotSize > 0 ? memberProductionKg / memberPlotSize : 0;

    // Get cooperative-wide historical data for comparison
    const historicalSeasons = seasons
      .filter(s => s.year < new Date().getFullYear() || (s.year === new Date().getFullYear() && s.name === 'Season-A'))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.name.localeCompare(a.name);
      })
      .slice(0, 3);

    // Calculate cooperative average yield from historical data
    let cooperativeAverageYield = 0;
    let historicalSeasonsCount = 0;

    for (const season of historicalSeasons) {
      const seasonProductions = allProductions.filter(p =>
        p.seasonId && p.seasonId.toString() === season._id.toString()
      );
      const seasonProduction = seasonProductions.reduce((sum, prod) => sum + prod.quantity, 0);
      const seasonPlots = allPlots.filter(p =>
        seasonProductions.some(prod => prod.userId.toString() === p.userId.toString())
      );
      const seasonLandArea = seasonPlots.reduce((sum, plot) => sum + plot.size, 0);

      if (seasonLandArea > 0) {
        const seasonYield = seasonProduction / seasonLandArea;
        cooperativeAverageYield += seasonYield;
        historicalSeasonsCount++;
      }
    }

    cooperativeAverageYield = historicalSeasonsCount > 0 ? cooperativeAverageYield / historicalSeasonsCount : 0;

    // Predict member's next season production
    const predictionMethod = cooperativeAverageYield > 0 ? 'cooperative_historical' :
                           memberYieldPerAre > 0 ? 'member_current' : 'none';

    const baseYield = cooperativeAverageYield > 0 ? cooperativeAverageYield : memberYieldPerAre;

    // Apply growth factor (assume 5% improvement)
    const growthFactor = 1.05;
    const predictedYieldPerAre = baseYield * growthFactor;

    const predictedTotalProduction = memberPlotSize * predictedYieldPerAre;

    // Calculate confidence level based on data availability
    const confidenceLevel = historicalSeasonsCount >= 2 ? 'High' :
                           historicalSeasonsCount >= 1 ? 'Medium' :
                           memberYieldPerAre > 0 ? 'Low' : 'Very Low';

    return {
      currentMetrics: {
        memberPlotSize,
        memberProductionKg,
        memberYieldPerAre,
        memberProductionValue,
      },
      cooperativeComparison: {
        cooperativeAverageYield,
        historicalSeasonsCount,
      },
      predictions: {
        method: predictionMethod,
        predictedYieldPerAre,
        predictedTotalProduction,
        confidenceLevel,
        assumptions: [
          'Based on cooperative historical performance',
          '5% annual improvement factor applied',
          `${historicalSeasonsCount} historical seasons analyzed`,
          'Using member\'s current land allocation'
        ]
      }
    };
  } catch (error) {
    console.error('Error calculating member production predictions:', error);
    return {
      currentMetrics: {
        memberPlotSize: 0,
        memberProductionKg: 0,
        memberYieldPerAre: 0,
        memberProductionValue: 0,
      },
      cooperativeComparison: {
        cooperativeAverageYield: 0,
        historicalSeasonsCount: 0,
      },
      predictions: {
        method: 'none',
        predictedYieldPerAre: 0,
        predictedTotalProduction: 0,
        confidenceLevel: 'N/A',
        assumptions: ['Insufficient data for predictions']
      }
    };
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};