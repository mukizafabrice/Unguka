import Stock from "../models/Stock.js";
import mongoose from "mongoose";

// Create a new Stock (for completeness, though not provided in the prompt)
export const createStock = async (req, res) => {
  try {
    const { productId, cooperativeId, quantity, totalPrice } = req.body;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid productId or cooperativeId" });
    }

    // Validate required fields
    if (quantity === undefined || totalPrice === undefined) {
      return res
        .status(400)
        .json({ message: "Quantity and totalPrice are required" });
    }

    // Create and save new Stock
    const newStock = new Stock({
      productId,
      cooperativeId,
      quantity,
      totalPrice,
    });
    await newStock.save();

    res
      .status(201)
      .json({ message: "Stock created successfully", data: newStock });
  } catch (error) {
    console.error("Error creating stock:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all stocks
export const getAllStocks = async (req, res) => {
  try {
    // ⭐ NEW: Allow filtering by cooperativeId from query parameters
    const { cooperativeId } = req.query;
    let query = {};

    if (cooperativeId) {
      if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res.status(400).json({ message: "Invalid cooperative ID" });
      }
      query.cooperativeId = cooperativeId;
    }

    const stocks = await Stock.find(query) // Apply the filter
      .populate("productId", "productName") // Populate product name
      .populate("cooperativeId", "name registrationNumber") // ⭐ NEW: Populate cooperative info
      .sort({ createdAt: -1 }) // Sort by creation date
      .exec();

    res
      .status(200)
      .json({
        success: true,
        data: stocks,
        message: "Stocks fetched successfully",
      });
  } catch (error) {
    console.error("Error fetching stock with products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get one Stock by ID
export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const { cooperativeId } = req.query; // Expect cooperativeId for authorization

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }
    if (cooperativeId && !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ message: "Invalid cooperative ID" });
    }

    let query = { _id: id };
    if (cooperativeId) {
      query.cooperativeId = cooperativeId; // Ensure stock belongs to the specified cooperative
    }

    const stock = await Stock.findOne(query)
      .populate("productId", "productName")
      .populate("cooperativeId", "name registrationNumber")
      .exec();

    if (!stock) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Stock not found or unauthorized access.",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        data: stock,
        message: "Stock fetched successfully",
      });
  } catch (error) {
    console.error("Error fetching stock by ID:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid stock ID format." });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update Stock by ID
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cooperativeId, quantity, totalPrice } = req.body; // Expect cooperativeId for authorization

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ message: "Cooperative ID is required and must be valid." });
    }

    const updateData = {};
    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }
    if (totalPrice !== undefined) {
      updateData.totalPrice = totalPrice;
    }

    const updatedStock = await Stock.findOneAndUpdate(
      { _id: id, cooperativeId: cooperativeId }, // Query by ID and cooperativeId for secure update
      updateData,
      { new: true, runValidators: true } // Return updated document and run schema validators
    )
      .populate("productId", "productName")
      .populate("cooperativeId", "name registrationNumber");

    if (!updatedStock) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Stock not found or unauthorized to update.",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Stock updated successfully",
        data: updatedStock,
      });
  } catch (error) {
    console.error("Error updating stock:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid stock ID format." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Stock by ID
export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cooperativeId } = req.body; // Expect cooperativeId for authorization

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid stock ID" });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ message: "Cooperative ID is required and must be valid." });
    }

    const deletedStock = await Stock.findOneAndDelete({
      _id: id,
      cooperativeId: cooperativeId,
    });

    if (!deletedStock) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Stock not found or unauthorized to delete.",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "Stock deleted successfully" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid stock ID format." });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
