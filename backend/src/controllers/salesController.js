import Sales from "../models/Sales.js";
import Stock from "../models/Stock.js";
import Loan from "../models/Loan.js";
import Season from "../models/Season.js";
import mongoose from "mongoose";

// Helper: Validate phone number
const isValidPhoneNumber = (phoneNumber) => {
  return /^(07[2-8]\d{7}|\+2507[2-8]\d{7})$/.test(phoneNumber);
};

// CREATE SALE
export const createSale = async (req, res) => {
  const {
    stockId,
    seasonId,
    quantity,
    unitPrice,
    buyer,
    phoneNumber,
    paymentType,
    cooperativeId,
  } = req.body;

  try {
    // Validation
    if (
      !mongoose.Types.ObjectId.isValid(stockId) ||
      !mongoose.Types.ObjectId.isValid(seasonId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID provided." });
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Unit Price must be non-negative." });
    }
    if (!buyer?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Buyer name is required." });
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid phone number required." });
    }
    if (!["cash", "loan"].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Payment type must be 'cash' or 'loan'.",
      });
    }

    const totalPrice = parsedQuantity * parsedUnitPrice;

    // Stock check
    const stock = await Stock.findOne({ _id: stockId, cooperativeId });
    if (!stock || stock.quantity < parsedQuantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock." });
    }

    // Season check
    const season = await Season.findOne({ _id: seasonId, cooperativeId });
    if (!season) {
      return res
        .status(404)
        .json({ success: false, message: "Season not found." });
    }

    // Create sale
    const newSale = new Sales({
      stockId,
      seasonId,
      cooperativeId,
      quantity: parsedQuantity,
      unitPrice: parsedUnitPrice,
      totalPrice,
      buyer: buyer.trim(),
      phoneNumber: phoneNumber.trim(),
      paymentType,
      status: paymentType === "cash" ? "paid" : "unpaid",
    });

    // Loan handling
    if (paymentType === "loan") {
      const newLoan = new Loan({
        userId: null,
        cooperativeId,
        amount: totalPrice,
        status: "pending",
        description: `Loan for sale of ${parsedQuantity} units to ${buyer}`,
      });
      await newLoan.save();
    }

    // Stock adjustment
    stock.quantity -= parsedQuantity;
    stock.totalPrice -= totalPrice;
    await stock.save();

    await newSale.save();

    res.status(201).json({
      success: true,
      message: "Sale created and stock adjusted successfully",
      data: newSale,
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET ALL SALES
export const getAllSales = async (req, res) => {
  try {
    const { cooperativeId } = req.query;

    const query = cooperativeId ? { cooperativeId } : {};
    const sales = await Sales.find(query)
      .populate({
        path: "stockId",
        select: "productId quantity",
        populate: { path: "productId", select: "productName" },
      })
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET SALE BY ID
export const getSaleById = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sale ID." });
    }

    const query = cooperativeId ? { _id: id, cooperativeId } : { _id: id };
    const sale = await Sales.findOne(query)
      .populate({
        path: "stockId",
        populate: { path: "productId", select: "productName" },
        select: "productId",
      })
      .populate("seasonId", "name year");

    if (!sale)
      return res
        .status(404)
        .json({ success: false, message: "Sale not found." });

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    console.error("Error fetching sale by ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET SALES BY PHONE
export const getSalesByPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.params;
  const { cooperativeId } = req.query;

  try {
    if (!isValidPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number." });
    }

    const query = cooperativeId
      ? { phoneNumber, cooperativeId }
      : { phoneNumber };
    const sales = await Sales.find(query)
      .populate({
        path: "stockId",
        populate: { path: "productId", select: "productName" },
        select: "productId",
      })
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 });

    if (!sales.length) {
      return res.status(404).json({
        success: false,
        message: "No sales found for this phone number.",
      });
    }

    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    console.error("Error fetching sales by phone:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE SALE
export const updateSale = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId, ...updates } = req.body;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID." });
    }

    const sale = await Sales.findOne({ _id: id, cooperativeId });
    if (!sale)
      return res
        .status(404)
        .json({ success: false, message: "Sale not found." });

    const stock = await Stock.findOne({ _id: sale.stockId, cooperativeId });
    if (!stock)
      return res
        .status(404)
        .json({ success: false, message: "Stock not found." });

    // Adjust quantity & price
    const newQuantity = updates.quantity
      ? Number(updates.quantity)
      : sale.quantity;
    const newUnitPrice = updates.unitPrice
      ? Number(updates.unitPrice)
      : sale.unitPrice;
    const newTotalPrice = newQuantity * newUnitPrice;

    const quantityDiff = newQuantity - sale.quantity;
    const priceDiff = newTotalPrice - sale.totalPrice;

    if (quantityDiff > 0 && stock.quantity < quantityDiff) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock." });
    }

    stock.quantity -= quantityDiff;
    stock.totalPrice -= priceDiff;

    sale.quantity = newQuantity;
    sale.unitPrice = newUnitPrice;
    sale.totalPrice = newTotalPrice;
    sale.status = sale.paymentType === "cash" ? "paid" : "unpaid";

    if (updates.phoneNumber && !isValidPhoneNumber(updates.phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number." });
    }

    Object.assign(sale, updates);

    await stock.save();
    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE SALE TO PAID (loan repayment)
export const updateSaleToPaid = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.body;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID." });
    }

    const sale = await Sales.findOne({ _id: id, cooperativeId });
    if (!sale)
      return res
        .status(404)
        .json({ success: false, message: "Sale not found." });

    if (sale.status === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Sale already paid." });
    }

    sale.status = "paid";
    await sale.save();

    res
      .status(200)
      .json({ success: true, message: "Sale marked as paid.", data: sale });
  } catch (error) {
    console.error("Error updating sale to paid:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE SALE
export const deleteSale = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.body;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID." });
    }

    const sale = await Sales.findOne({ _id: id, cooperativeId });
    if (!sale)
      return res
        .status(404)
        .json({ success: false, message: "Sale not found." });

    const stock = await Stock.findOne({ _id: sale.stockId, cooperativeId });
    if (stock) {
      stock.quantity += sale.quantity;
      stock.totalPrice += sale.totalPrice;
      await stock.save();
    }

    await Sales.findOneAndDelete({ _id: id, cooperativeId });

    res
      .status(200)
      .json({ success: true, message: "Sale deleted and stock adjusted." });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// controllers/salesReportController.js
import PDFDocument from "pdfkit";

export const downloadSalesPDF = async (req, res) => {
  try {
    const { cooperativeId } = req.user;
    const sales = await Sales.find({ cooperativeId })
      .populate({
        path: "stockId",
        select: "productId",
        populate: {
          path: "productId",
          select: "productName",
        },
      })
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name")
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales.pdf");
    doc.pipe(res);

    // --- Table Headers Configuration ---
    const tableColumns = [
      { header: "Product", width: 60 },
      { header: "Qty", width: 50 },
      { header: "Unit Price", width: 50 },
      { header: "Total", width: 50 },
      { header: "Buyer", width: 70 },
      { header: "Payment", width: 50 },
      { header: "Status", width: 60 },
      { header: "Season", width: 70 },
      { header: "Date", width: 70 },
    ];

    // Helper function to draw headers on any page
    const drawHeaders = (document, yPosition) => {
      let currentX = 50;
      document.fontSize(9).font("Helvetica-Bold");
      tableColumns.forEach((col) => {
        document.text(col.header, currentX, yPosition, {
          width: col.width,
          align: "left",
        });
        currentX += col.width;
      });
      document.moveDown();
      document
        .strokeColor("#ccc")
        .lineWidth(1)
        .moveTo(50, document.y)
        .lineTo(550, document.y)
        .stroke();
      document.moveDown();
    };

    // --- Main Document Content ---
    doc.fontSize(18).text("Sales Report", { align: "center", bold: true });
    doc.moveDown(2);

    drawHeaders(doc, doc.y);

    // --- Table Rows ---
    doc.font("Helvetica").fontSize(9);
    let yPosition = doc.y;

    sales.forEach((s) => {
      // Check for page break
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
        drawHeaders(doc, yPosition);
        yPosition = doc.y; // Update yPosition after drawing headers
      }

      const rowData = [
        s.stockId?.productId?.productName || "N/A",
        s.quantity.toString(),
        s.unitPrice.toString(),
        s.totalPrice.toString(),
        s.buyer,
        s.paymentType,
        s.status,
        `${s.seasonId?.name} ${s.seasonId?.year || ""}`.trim(), // Correctly concatenate season name and year
        new Date(s.createdAt).toLocaleDateString("en-GB"),
      ];

      let currentX = 50;
      rowData.forEach((cell, index) => {
        const col = tableColumns[index];
        doc.text(cell, currentX, yPosition, {
          width: col.width,
          align: "left",
        });
        currentX += col.width;
      });

      yPosition += 20; // Fixed row height
    });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message });
  }
};

import ExcelJS from "exceljs";
// Generate Excel for Sales filtered by cooperative
export const downloadSalesExcel = async (req, res) => {
  try {
    const { cooperativeId } = req.user;
    const sales = await Sales.find({ cooperativeId })
      .populate({
        path: "stockId",
        select: "productId",
        populate: {
          path: "productId",
          select: "productName",
        },
      })
      .populate("seasonId", "name")
      .populate("cooperativeId", "name");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales");

    // Headers
    worksheet.columns = [
      { header: "Product", key: "product", width: 20 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Unit Price", key: "unitPrice", width: 12 },
      { header: "Total Price", key: "totalPrice", width: 15 },
      { header: "Buyer", key: "buyer", width: 20 },
      { header: "Phone", key: "phoneNumber", width: 20 },
      { header: "Payment Type", key: "paymentType", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Season", key: "season", width: 20 },
      { header: "Cooperative", key: "cooperative", width: 20 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Data rows
    sales.forEach((s) => {
      worksheet.addRow({
        product: s.stockId?.productId?.productName, // Corrected typo here
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        totalPrice: s.totalPrice,
        buyer: s.buyer,
        phoneNumber: s.phoneNumber,
        paymentType: s.paymentType,
        status: s.status,
        season: s.seasonId?.name,
        cooperative: s.cooperativeId?.name,
        date: new Date(s.createdAt).toLocaleDateString("en-GB"),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=sales.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel generation error:", err);
    res.status(500).json({ error: err.message });
  }
};
