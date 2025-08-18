import Production from "../models/Production.js";
import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js"; // Assuming Product model also has cooperativeId
import User from "../models/User.js"; // Import User model to populate user details
import Season from "../models/Season.js"; // ⭐ ADD THIS LINE: Import the Season model

export const createProduction = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, unitPrice, cooperativeId } =
      req.body;

    // --- Input Validation and Type Conversion ---
    // Ensure IDs are valid Mongoose ObjectIds
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

    // ⭐ CORRECTED LINE: Use the 'Season' model to find the season
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
      cooperativeId, // Include cooperativeId
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
    const { cooperativeId } = req.query; // ⭐ Get cooperativeId from query
    let query = {};

    if (cooperativeId) {
      if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cooperative ID format." });
      }
      query.cooperativeId = cooperativeId; // ⭐ Apply filter
    }

    const productions = await Production.find(query) // ⭐ Apply query filter
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name") // ⭐ Populate cooperative info
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
    const { userId, seasonId, cooperativeId } = req.query; // ⭐ Added cooperativeId

    if (!userId || !seasonId || !cooperativeId) {
      // ⭐ Validate cooperativeId
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
    }) // ⭐ Added cooperativeId to query
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

// Get productions for a specific user (scoped by cooperativeId)
export const getProductionsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const { cooperativeId } = req.query; // ⭐ Get cooperativeId from query for authorization

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Cooperative ID is required and must be valid.",
      });
    }

    const productions = await Production.find({ userId, cooperativeId }) // ⭐ Filter by cooperativeId
      .populate("userId", "names")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name") // ⭐ Populate cooperative info
      .sort({ createdAt: -1 })
      .exec();

    if (!productions || productions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No productions found for this user in this cooperative",
      }); // Consistent response
    }

    res.status(200).json({
      success: true,
      data: productions,
      message: "Productions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching productions by user ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
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
      // If changing product, also ensure old stock is decreased and new stock increased if necessary.
      // For simplicity, sticking to previous logic: changing product is not supported directly through this endpoint
      // as it complicates stock adjustments greatly (requires reducing old product stock and adding to new product stock).
      // If this functionality is needed, it would typically be a more complex, dedicated "transfer production" or "edit product in production" flow.
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
      { _id: req.params.id, cooperativeId }, // ⭐ Filter by cooperativeId
      {
        productId, // Keep productId or update if allowed (handled above)
        quantity: parsedQuantity,
        unitPrice: parsedUnitPrice,
        totalPrice: newTotal,
        // Assuming other fields like userId, seasonId are not updated here for simplicity
        // If they can be updated, they should also be validated and included.
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
    }); // ⭐ Filter by cooperativeId
    if (stock) {
      stock.quantity = stock.quantity - oldQuantity + parsedQuantity;
      stock.totalPrice = stock.totalPrice - oldTotal + newTotal;
      await stock.save();
    } else {
      // This scenario means stock record was somehow missing, and we might need to recreate it.
      // Or it's an error state if stock should always exist for a product in production.
      // For now, if stock doesn't exist, we don't try to create a new one during update to avoid accidental new records.
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
    const { cooperativeId } = req.body; // ⭐ Expect cooperativeId in body for authorization

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
