import PurchaseOut from "../models/PurchaseOut.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js"; // Assuming Cash remains a global entity, not cooperative-specific
import Product from "../models/Product.js"; // To verify product exists in cooperative
import Season from "../models/Season.js"; // To verify season exists in cooperative
import mongoose from "mongoose";

// Create a new purchase-out record
export const createPurchaseOut = async (req, res) => {
  // Destructure productId, seasonId, quantity, unitPrice, and cooperativeId from the request body
  const { productId, seasonId, quantity, unitPrice, cooperativeId } = req.body;

  try {
    // --- Input Validation and Type Conversion ---
    // Validate that all required IDs are valid Mongoose ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID provided for product, season, or cooperative." });
    }

    // Convert quantity and unitPrice to numbers and validate them
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (
      !Number.isFinite(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be a positive integer." });
    }

    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Unit Price must be a positive number." });
    }
    // --- End of Input Validation ---

    const totalPrice = parsedQuantity * parsedUnitPrice;

    // 1. Verify that the productId and seasonId actually belong to the given cooperativeId.
    // This prevents a manager from linking products/seasons from another cooperative.
    const product = await Product.findOne({ _id: productId, cooperativeId });
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found in this cooperative." });
    }

    const season = await Season.findOne({ _id: seasonId, cooperativeId });
    if (!season) {
        return res.status(404).json({ success: false, message: "Season not found in this cooperative." });
    }

    // 2. Create and save the new purchase-out record, explicitly including the cooperativeId.
    const newPurchaseOut = new PurchaseOut({
      productId,
      seasonId,
      cooperativeId, // Link the purchase-out to the cooperative
      quantity: parsedQuantity,
      unitPrice: parsedUnitPrice,
      totalPrice,
    });
    await newPurchaseOut.save();

    // 3. Update stock: find the stock record for this product *within this cooperative*
    // and subtract the quantity and total price.
    let stock = await Stock.findOne({ productId, cooperativeId });

    if (stock) {
      if (stock.quantity < parsedQuantity) {
        // If there isn't enough stock, rollback the purchase-out creation
        await PurchaseOut.findByIdAndDelete(newPurchaseOut._id);
        return res.status(400).json({ success: false, message: "Insufficient stock for this product in the cooperative." });
      }
      stock.quantity -= parsedQuantity;
      stock.totalPrice -= totalPrice;
    } else {
      // If no stock record exists for this product in this cooperative,
      // it implies an attempt to purchase out from non-existent stock, so rollback.
      await PurchaseOut.findByIdAndDelete(newPurchaseOut._id);
      return res.status(404).json({ success: false, message: "Stock record not found for this product in the cooperative. Cannot process purchase-out." });
    }
    await stock.save(); // Save the updated stock

    // 4. Update cash (assuming Cash model does NOT have cooperativeId and is global across the system)
    const existingCash = await Cash.findOne(); // Find the single cash document
    if (!existingCash) {
        // If cash document doesn't exist, it's a server configuration error.
        // Rollback previous operations.
        await PurchaseOut.findByIdAndDelete(newPurchaseOut._id);
        await Stock.findByIdAndUpdate(stock._id, { $inc: { quantity: parsedQuantity, totalPrice: totalPrice } }); // Rollback stock
        return res.status(500).json({ success: false, message: "Cash balance record not found. Please initialize cash balance." });
    }
    // Ensure sufficient cash balance for the purchase-out
    if (existingCash.amount < totalPrice) {
      // Rollback operations if cash is insufficient
      await PurchaseOut.findByIdAndDelete(newPurchaseOut._id);
      await Stock.findByIdAndUpdate(stock._id, { $inc: { quantity: parsedQuantity, totalPrice: totalPrice } }); // Rollback stock
      return res.status(400).json({ success: false, message: "Insufficient cash balance to process this purchase-out." });
    } else {
      existingCash.amount -= totalPrice; // Deduct total price from cash
      await existingCash.save(); // Save the updated cash balance
    }

    // Respond with success message and the created purchase-out record
    res.status(201).json({
      success: true,
      message: "Purchase-out record created and stock/cash adjusted successfully",
      data: newPurchaseOut,
    });
  } catch (error) {
    console.error("Error creating purchase-out record:", error);
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      console.error("Mongoose Validation Errors:", error.errors);
      return res
        .status(400)
        .json({ success: false, message: error.message, errors: error.errors });
    }
    // Catch any other server errors
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all purchase-out records
// Can be filtered by cooperativeId to get records for a specific cooperative.
export const getAllPurchaseOut = async (req, res) => {
  try {
    const { cooperativeId } = req.query; // Get cooperativeId from query parameters
    let query = {};

    // If cooperativeId is provided, add it to the query to filter results
    if (cooperativeId) {
        if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
            return res.status(400).json({ success: false, message: "Invalid cooperative ID format." });
        }
        query.cooperativeId = cooperativeId;
    }

    // Find purchase-out records based on the query, populate related fields, and sort by creation date
    const purchases = await PurchaseOut.find(query)
      .populate("productId", "productName") // Populate product name
      .populate("seasonId", "year name")    // Populate season name and year
      .populate("cooperativeId", "name")   // Populate cooperative name
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ success: true, data: purchases, message: "Purchase-out records fetched successfully" });
  } catch (error) {
    console.error("Error fetching all purchase-out records:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get a single purchase-out record by ID
// Requires cooperativeId from query for authorization and data scoping.
export const getPurchaseOutById = async (req, res) => {
  const { id } = req.params; // Get purchase-out ID from URL parameters
  const { cooperativeId } = req.query; // Get cooperativeId from query parameters

  try {
    // Validate both the purchase-out ID and cooperative ID formats
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid purchase-out ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res.status(400).json({ success: false, message: "Cooperative ID is required and must be valid." });
    }

    // Find the purchase-out record by its ID and ensure it belongs to the specified cooperative.
    const purchase = await PurchaseOut.findOne({ _id: id, cooperativeId })
      .populate("productId", "productName")
      .populate("seasonId", "year name")
      .populate("cooperativeId", "name");

    // If no record is found, it means either the ID is wrong or the user is unauthorized.
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase-out record not found or unauthorized." });
    }

    res.status(200).json({ success: true, data: purchase, message: "Purchase-out record fetched successfully" });
  } catch (error) {
    console.error("Error fetching purchase-out record by ID:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update a purchase-out record
// Requires cooperativeId in the request body for authorization and data scoping.
export const updatePurchaseOut = async (req, res) => {
  const { id } = req.params; // Get purchase-out ID from URL parameters
  const { productId, seasonId, quantity, unitPrice, cooperativeId } = req.body; // Get updated data and cooperativeId

  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid purchase-out ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res.status(400).json({ success: false, message: "Cooperative ID is required and must be valid." });
    }

    // Find the existing purchase-out record by ID and cooperativeId to ensure authorization.
    const oldPurchase = await PurchaseOut.findOne({ _id: id, cooperativeId });
    if (!oldPurchase) {
      return res.status(404).json({ success: false, message: "Purchase-out record not found or unauthorized." });
    }

    // Prevent changing productId or seasonId after creation as per previous requirements.
    if (productId && productId.toString() !== oldPurchase.productId.toString()) {
      return res.status(400).json({ success: false, message: "Changing product is not allowed for purchase-out updates." });
    }
    if (seasonId && seasonId.toString() !== oldPurchase.seasonId.toString()) {
      return res.status(400).json({ success: false, message: "Changing season is not allowed for purchase-out updates." });
    }

    // Input Validation for updated quantity and unit price
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (
        !Number.isFinite(parsedQuantity) ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity <= 0
    ) {
        return res.status(400).json({ success: false, message: "Quantity must be a positive integer." });
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
        return res.status(400).json({ success: false, message: "Unit Price must be a positive number." });
    }

    const oldTotal = oldPurchase.totalPrice;
    const newTotal = parsedQuantity * parsedUnitPrice;

    // 1. Adjust stock: Revert the effect of the old purchase-out, then apply the effect of the new.
    const stock = await Stock.findOne({ productId: oldPurchase.productId, cooperativeId });
    if (!stock) {
        // This indicates an inconsistency if a stock record should always exist for a product.
        return res.status(404).json({ success: false, message: "Associated stock record not found for this purchase-out." });
    }

    // Calculate the difference in quantity and total price
    const quantityDifference = parsedQuantity - oldPurchase.quantity;
    const totalPriceDifference = newTotal - oldTotal;

    // Check if increasing quantity would lead to negative stock
    if (stock.quantity < quantityDifference && quantityDifference > 0) {
        return res.status(400).json({ success: false, message: "Insufficient stock to increase purchase-out quantity to this amount." });
    }

    stock.quantity -= quantityDifference; // Update stock quantity
    stock.totalPrice -= totalPriceDifference; // Update stock total price
    await stock.save();

    // 2. Adjust cash: Revert old cash effect, then apply new cash effect.
    const cash = await Cash.findOne(); // Assuming Cash is a global single document
    if (!cash) {
        // If cash document doesn't exist, rollback stock changes and return error.
        stock.quantity += quantityDifference;
        stock.totalPrice += totalPriceDifference;
        await stock.save();
        return res.status(500).json({ success: false, message: "Cash balance record not found. Please initialize cash balance." });
    }

    const cashChange = newTotal - oldTotal; // The change in total price affects cash
    if (cash.amount < cashChange && cashChange > 0) {
        // If the new purchase-out is more expensive and cash is insufficient, rollback.
        stock.quantity += quantityDifference;
        stock.totalPrice += totalPriceDifference;
        await stock.save();
        return res.status(400).json({ success: false, message: "Insufficient cash balance to cover the increased purchase-out amount." });
    }

    cash.amount -= cashChange; // Adjust cash amount
    await cash.save();

    // 3. Update the purchase-out record itself.
    const updatedPurchase = await PurchaseOut.findOneAndUpdate(
      { _id: id, cooperativeId }, // Query by both ID and cooperativeId for security
      {
        quantity: parsedQuantity,
        unitPrice: parsedUnitPrice,
        totalPrice: newTotal,
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    )
    .populate("productId", "productName")
    .populate("seasonId", "year name")
    .populate("cooperativeId", "name");

    if (!updatedPurchase) {
        return res.status(404).json({ success: false, message: "Purchase-out record not found or failed to update." });
    }

    res.status(200).json({
      success: true,
      message: "Purchase-out updated successfully with stock & cash adjusted",
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase-out record:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a purchase-out record
// Requires cooperativeId in the request body for authorization and data scoping.
export const deletePurchaseOut = async (req, res) => {
  const { id } = req.params; // Get purchase-out ID from URL parameters
  const { cooperativeId } = req.body; // Get cooperativeId from request body for authorization

  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid purchase-out ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res.status(400).json({ success: false, message: "Cooperative ID is required and must be valid." });
    }

    // Find the purchase-out record by ID and cooperativeId to ensure authorization before deletion.
    const purchase = await PurchaseOut.findOne({ _id: id, cooperativeId });
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase-out record not found or unauthorized." });
    }

    // 1. Adjust stock: Return the quantity and total price of the deleted purchase-out to stock.
    const stock = await Stock.findOne({ productId: purchase.productId, cooperativeId });
    if (stock) {
      stock.quantity += purchase.quantity;
      stock.totalPrice += purchase.totalPrice;
      await stock.save();
    } else {
        console.warn(`Stock for product ${purchase.productId} in cooperative ${cooperativeId} not found during purchase-out deletion.`);
        // This might indicate an inconsistency if a stock record should always exist.
    }

    // 2. Adjust cash: Return the total price of the deleted purchase-out to cash.
    const cash = await Cash.findOne(); // Assuming Cash is a global single document
    if (cash) {
      cash.amount += purchase.totalPrice;
      await cash.save();
    } else {
        console.warn("Cash balance record not found during purchase-out deletion.");
    }

    // 3. Delete the purchase-out record itself.
    await PurchaseOut.findOneAndDelete({ _id: id, cooperativeId });

    res.status(200).json({ success: true, message: "Purchase-out deleted and stock/cash adjusted successfully" });
  } catch (error) {
    console.error("Error deleting purchase-out record:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};