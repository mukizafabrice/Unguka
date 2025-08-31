import Production from "../models/Production.js";
import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Season from "../models/Season.js";
// For PDF and Excel generation
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export const createProduction = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, unitPrice, cooperativeId } =
      req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid ID provided for user, product, season, or cooperative.",
      });
    }

    // Convert quantity and unitPrice to numbers and validate
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    // Check if quantity is a finite positive integer
    if (
      !Number.isFinite(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }

    // Check if unitPrice is a finite positive number
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price must be a positive number.",
      });
    }
    // --- End of Input Validation ---

    const totalPrice = parsedQuantity * parsedUnitPrice;

    // 1. Verify that the productId, seasonId, and userId actually belong to the given cooperativeId
    // This adds an extra layer of security and data integrity.
    const product = await Product.findOne({ _id: productId, cooperativeId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this cooperative.",
      });
    }

    const user = await User.findOne({ _id: userId, cooperativeId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in this cooperative.",
      });
    }

    const season = await Season.findOne({ _id: seasonId, cooperativeId });
    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found in this cooperative.",
      });
    }

    // 2. Save new production
    const newProduction = new Production({
      userId,
      productId,
      seasonId,
      cooperativeId,
      quantity: parsedQuantity,
      unitPrice: parsedUnitPrice,
      totalPrice,
    });

    await newProduction.save();

    // 3. Update stock (add to existing or create new) within the same cooperative
    const existingStock = await Stock.findOne({ productId, cooperativeId }); // Filter by cooperativeId

    if (existingStock) {
      existingStock.quantity = existingStock.quantity + parsedQuantity;
      existingStock.totalPrice = existingStock.totalPrice + totalPrice;
      await existingStock.save();
    } else {
      const newStock = new Stock({
        productId,
        cooperativeId, // Include cooperativeId
        quantity: parsedQuantity,
        totalPrice,
      });
      await newStock.save();
    }

    return res.status(201).json({
      success: true, // Consistent success flag
      message: "Production created and stock updated successfully",
      data: newProduction,
    });
  } catch (error) {
    console.error("Error creating production:", error);
    if (error.name === "ValidationError") {
      console.error("Mongoose Validation Errors:", error.errors);
      return res
        .status(400)
        .json({ success: false, message: error.message, errors: error.errors });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message }); // Consistent error flag
  }
};

// Get all productions (can be filtered by cooperativeId)
export const getAllProductions = async (req, res) => {
  try {
    const { cooperativeId } = req.query;
    let query = {};

    if (cooperativeId) {
      if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cooperative ID format." });
      }
      query.cooperativeId = cooperativeId;
    }

    const productions = await Production.find(query)
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: productions,
      message: "Productions fetched successfully",
    }); // Consistent response
  } catch (error) {
    console.error("Error fetching all productions:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get productions by userId and seasonId (scoped by cooperativeId)
export const getProductions = async (req, res) => {
  try {
    const { userId, seasonId, cooperativeId } = req.query;

    if (!userId || !seasonId || !cooperativeId) {
      return res.status(400).json({
        success: false,
        message: "userId, seasonId, and cooperativeId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(seasonId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format for user, season, or cooperative.",
      });
    }

    // This query finds productions that match user, season, and cooperative
    const productions = await Production.find({
      userId,
      seasonId,
      cooperativeId,
    })
      .populate("userId", "names")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name") // ⭐ Populate cooperative info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: productions,
      message: "Productions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching productions by user and season:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get one production by ID
export const getProductionsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const productions = await Production.find({ userId })
      .populate("userId", "names")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 })
      .exec();

    if (!productions || productions.length === 0) {
      return res
        .status(404)
        .json({ message: "No productions found for this user" });
    }

    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduction = async (req, res) => {
  try {
    const { productId, quantity, unitPrice, cooperativeId } = req.body; // ⭐ Added cooperativeId

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid production ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Cooperative ID is required and must be valid.",
      });
    }

    // Find the production, ensuring it belongs to the specified cooperative
    const existing = await Production.findOne({
      _id: req.params.id,
      cooperativeId,
    }); // ⭐ Filter by cooperativeId
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Production not found or unauthorized.",
      });
    }

    const oldQuantity = existing.quantity;
    const oldTotal = existing.totalPrice;

    // Check if productId is changed. If so, validate it belongs to the same cooperative.
    if (productId && productId.toString() !== existing.productId.toString()) {
      const newProduct = await Product.findOne({
        _id: productId,
        cooperativeId,
      });
      if (!newProduct) {
        return res.status(400).json({
          success: false,
          message:
            "New product not found or does not belong to this cooperative.",
        });
      }
      return res.status(400).json({
        success: false,
        message:
          "Changing the product associated with a production is not supported via this endpoint.",
      });
    }

    // Parse and validate new quantity and unitPrice
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (
      !Number.isFinite(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }

    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price must be a positive number.",
      });
    }

    const newTotal = parsedQuantity * parsedUnitPrice;

    // Update the production, ensuring it belongs to the specified cooperative
    const updated = await Production.findOneAndUpdate(
      { _id: req.params.id, cooperativeId },
      {
        productId, // Keep productId or update if allowed (handled above)
        quantity: parsedQuantity,
        unitPrice: parsedUnitPrice,
        totalPrice: newTotal,
      },
      { new: true, runValidators: true } // Run validators for quantity/totalPrice
    )
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Production not found or unauthorized after update attempt.",
      });
    }

    // Adjust stock within the same cooperative
    const stock = await Stock.findOne({
      productId: updated.productId,
      cooperativeId,
    });
    if (stock) {
      stock.quantity = stock.quantity - oldQuantity + parsedQuantity;
      stock.totalPrice = stock.totalPrice - oldTotal + newTotal;
      await stock.save();
    } else {
      console.warn(
        `Stock for product ${updated.productId} in cooperative ${cooperativeId} not found during update.`
      );
    }

    res.status(200).json({
      success: true,
      message: "Production updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating production:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ success: false, message: error.message, errors: error.errors });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteProduction = async (req, res) => {
  try {
    const { cooperativeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid production ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Cooperative ID is required and must be valid.",
      });
    }

    // Find the production, ensuring it belongs to the specified cooperative
    const production = await Production.findOne({
      _id: req.params.id,
      cooperativeId,
    }); // ⭐ Filter by cooperativeId
    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Production not found or unauthorized.",
      });
    }

    // Adjust stock within the same cooperative
    const stock = await Stock.findOne({
      productId: production.productId,
      cooperativeId,
    }); // ⭐ Filter by cooperativeId
    if (stock) {
      stock.quantity -= production.quantity;
      stock.totalPrice -= production.totalPrice;
      if (stock.quantity <= 0) {
        await stock.deleteOne(); // Optionally remove stock record if empty
        console.log(
          `Stock for product ${production.productId} in cooperative ${cooperativeId} removed as quantity dropped to zero.`
        );
      } else {
        await stock.save();
      }
    } else {
      console.warn(
        `Stock for product ${production.productId} in cooperative ${cooperativeId} not found during deletion.`
      );
    }

    // Delete production, ensuring it belongs to the specified cooperative
    await Production.findOneAndDelete({ _id: req.params.id, cooperativeId }); // ⭐ Filter by cooperativeId

    res
      .status(200)
      .json({ success: true, message: "Production deleted successfully" });
  } catch (error) {
    console.error("Error deleting production:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const Productions = async (req, res) => {
  try {
    const productions = await Production.find()
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: productions,
      message: "Productions fetched successfully",
    }); // Consistent response
  } catch (error) {
    console.error("Error fetching all productions:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// This is the corrected version of your backend function
export const exportProductionsToExcel = async (req, res) => {
  try {
    const { cooperativeId } = req.user;

    const productions = await Production.find({ cooperativeId })
      .populate("userId", "names email")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Production");

    // Define columns
    worksheet.columns = [
      { header: "User", key: "user", width: 30 },
      { header: "Product Name", key: "productName", width: 20 },
      { header: "Season", key: "season", width: 20 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Unity Price", key: "unitPrice", width: 15 },
      { header: "Total Price", key: "totalPrice", width: 15 },
      { header: "Created At", key: "createdAt", width: 15 },
    ];

    // Add data to rows, correctly accessing populated fields
    productions.forEach((p) => {
      // Use this log to debug which document is causing the error
      console.log(p);

      worksheet.addRow({
        user: p.userId?.names || "N/A",
        productName: p.productId?.productName || "N/A",
        season: `${p.seasonId?.name || ""} (${p.seasonId?.year || ""})`.trim(),
        quantity: p.quantity || 0,
        unitPrice: p.unitPrice || 0,
        totalPrice: p.totalPrice || 0,
        createdAt: new Date(p.createdAt).toLocaleDateString("en-GB"),
      });
    });

    // Set headers for the file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=productions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generating Excel:", err);
    res.status(500).send("Error generating Excel");
  }
};

export const exportProductionsToPDF = async (req, res) => {
  try {
    const { cooperativeId } = req.user;

    const productions = await Production.find({ cooperativeId })
      .populate("userId", "names email")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name");

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=productions.pdf"
    );
    doc.pipe(res);

    // --- Header and Title ---
    doc
      .fontSize(22)
      .fillColor("#333")
      .text("Production Report", { align: "center" });
    doc.moveDown(1);
    if (productions.length > 0) {
      const coopName = productions[0].cooperativeId?.name || "N/A";
      doc
        .fontSize(14)
        .fillColor("#555")
        .text(`Cooperative: ${coopName}`, { align: "center" });
    }
    doc.moveDown(1);

    // --- Table Headers Configuration ---
    const tableColumns = [
      { header: "User", width: 80 }, // Reduced width
      { header: "Product", width: 60 }, // Reduced width and simplified name
      { header: "Season", width: 80 }, // Reduced width
      { header: "Qty", width: 50 }, // Reduced width and simplified name
      { header: "Unit Price", width: 60 },
      { header: "Total Price", width: 70 },
      { header: "Created At", width: 80 }, // Reduced width
    ];
    const startX = 50;
    const padding = 10;
    const totalTableWidth =
      tableColumns.reduce((sum, col) => sum + col.width, 0) +
      (tableColumns.length - 1) * padding;
    const endX = startX + totalTableWidth;

    // Helper function to draw table headers
    const drawTableHeaders = (yPosition) => {
      let currentX = startX;
      doc.fontSize(10).font("Helvetica-Bold");
      tableColumns.forEach((col) => {
        doc.text(col.header, currentX, yPosition, {
          width: col.width,
          align: "left",
        });
        currentX += col.width + padding;
      });
      doc.moveDown(1);
      doc
        .strokeColor("#ccc")
        .lineWidth(1)
        .moveTo(startX, doc.y)
        .lineTo(endX, doc.y)
        .stroke();
      doc.moveDown(0.5);
    };

    // --- Draw Initial Table Headers ---
    drawTableHeaders(doc.y);

    // --- Table Rows ---
    doc.font("Helvetica").fontSize(9);
    let yPosition = doc.y;

    productions.forEach((p) => {
      // Check for page break
      if (yPosition + 30 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        yPosition = doc.page.margins.top;
        drawTableHeaders(yPosition);
        yPosition = doc.y;
      }

      const rowData = [
        p.userId?.names || "N/A",
        p.productId?.productName || "N/A",
        p.seasonId ? `${p.seasonId.name} (${p.seasonId.year})` : "N/A",
        p.quantity?.toString() || "N/A",
        p.unitPrice?.toString() || "N/A",
        p.totalPrice?.toString() || "N/A",
        p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB") : "N/A",
      ];

      let currentX = startX;
      rowData.forEach((cell, index) => {
        doc.text(cell, currentX, yPosition, {
          width: tableColumns[index].width,
          align: "left",
        });
        currentX += tableColumns[index].width + padding;
      });

      yPosition += 20; // Fixed row height
    });

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
};
