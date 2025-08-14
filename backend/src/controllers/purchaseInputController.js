import mongoose from "mongoose";
import PurchaseInput from "../models/PurchaseInput.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js"; // Assuming Cash model will also be cooperative-specific
import Loan from "../models/Loan.js"; // Assuming Loan model will also be cooperative-specific

// Note: LoanTransaction import was not used, removed for clarity.
// import LoanTransaction from "../models/LoanTransaction.js";

// Create a new Purchase Input
export const createPurchaseInput = async (req, res) => {
  try {
    const {
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      amountPaid,
      interest,
      cooperativeId, // ⭐ NEW: Extract cooperativeId from req.body
    } = req.body;

    // Validate ObjectIds including cooperativeId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId) // ⭐ NEW: Validate cooperativeId
    ) {
      return res
        .status(400)
        .json({ message: "Invalid userId, productId, seasonId, or cooperativeId format." });
    }

    // Validate quantities and prices
    if (quantity <= 0 || unitPrice <= 0 || amountPaid < 0) {
      return res.status(400).json({
        message:
          "Quantity and Unit Price must be positive, and amount paid cannot be negative.",
      });
    }

    // Check if product exists within the *specific cooperative*
    const productExists = await Product.findOne({ _id: productId, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    if (!productExists) {
      return res.status(404).json({ message: "Product not found in this cooperative." });
    }

    const totalPrice = unitPrice * quantity;
    if (amountPaid > totalPrice) {
      return res
        .status(400)
        .json({ message: "Amount paid cannot exceed total price." });
    }

    const amountRemaining = totalPrice - amountPaid;

    // Check stock for the product within the *specific cooperative*
    const stock = await Stock.findOne({ productId: productId, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    if (!stock) {
      return res.status(404).json({ message: "Stock for this product not found in your cooperative." });
    }
    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available for this product." });
    }

    // Update stock quantity
    stock.quantity -= quantity;
    await stock.save();

    // Update cooperative's cash balance
    if (amountPaid > 0) {
      let cash = await Cash.findOne({ cooperativeId: cooperativeId }); // ⭐ UPDATED: Find cash for specific cooperative
      if (!cash) {
        // If no cash document exists for this cooperative, create one
        cash = new Cash({ amount: 0, cooperativeId: cooperativeId }); // ⭐ NEW: Include cooperativeId
      }
      cash.amount += amountPaid;
      await cash.save();
    }

    const status = amountRemaining > 0 ? "loan" : "paid";
    let finalAmountRemaining = amountRemaining;
    let loanRevenue = 0; // Initialize loanRevenue

    if (amountRemaining > 0) {
      // Assuming 'interest' from req.body is a percentage (e.g., 5 for 5%)
      const loanInterestRate = interest / 100;
      loanRevenue = amountRemaining * loanInterestRate;
      finalAmountRemaining = amountRemaining + loanRevenue;
    }

    // Create new PurchaseInput document
    const newPurchase = await PurchaseInput.create({
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      totalPrice,
      status,
      amountPaid,
      amountRemaining: finalAmountRemaining,
      cooperativeId, // ⭐ NEW: Include cooperativeId in purchase input
    });

    // Create a new Loan document if there's an outstanding amount
    if (finalAmountRemaining > 0) {
      await Loan.create({
        purchaseInputId: newPurchase._id,
        userId,
        cooperativeId, // ⭐ NEW: Include cooperativeId in loan
        quantity, // This might be redundant if loan tracks payment, not physical quantity
        amountOwed: finalAmountRemaining,
        loanRevenue: loanRevenue,
        interest,
        status: "pending",
      });
    }

    res.status(201).json({
      message: "Purchase recorded successfully",
      purchase: newPurchase,
    });
  } catch (error) {
    console.error("Error creating purchase input:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Purchase Inputs
export const getAllPurchaseInputs = async (req, res) => {
  try {
    // ⭐ NEW: Allow filtering by cooperativeId and userId from query parameters
    const { cooperativeId, userId } = req.query;
    let query = {};

    if (cooperativeId) {
      if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res.status(400).json({ message: "Invalid cooperative ID" });
      }
      query.cooperativeId = cooperativeId;
    }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      query.userId = userId;
    }

    const purchases = await PurchaseInput.find(query) // ⭐ UPDATED: Apply filter
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name registrationNumber") // ⭐ NEW: Populate cooperative info
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching all purchase inputs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Purchase Inputs by User ID (modified to include cooperativeId for security)
// This endpoint now expects `id` to be the PurchaseInput's _id or a userId if `cooperativeId` is present
// Given your route is `/:id`, I'll assume `id` is the PurchaseInput's ID for `getPurchaseInputById`
// And for getting purchases *for a user*, it should be a separate route or use a query parameter.
// Let's adjust this to expect `id` as `_id` of PurchaseInput and `cooperativeId` as query.
export const getPurchaseInputById = async (req, res) => {
  try {
    const { id } = req.params; // This is the PurchaseInput ID
    const { cooperativeId } = req.query; // ⭐ NEW: Expect cooperativeId for authorization

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase input ID format." });
    }
    if (cooperativeId && !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ message: "Invalid cooperative ID format." });
    }

    let query = { _id: id };
    if (cooperativeId) {
      query.cooperativeId = cooperativeId; // ⭐ NEW: Filter by cooperativeId
    }

    const purchase = await PurchaseInput.findOne(query) // ⭐ UPDATED: Use findOne with query
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name registrationNumber") // ⭐ NEW: Populate cooperative info
      .sort({ createdAt: -1 });

    if (!purchase) {
      return res
        .status(404)
        .json({ message: "Purchase input not found or unauthorized access." });
    }

    res.status(200).json(purchase); // Return single purchase object
  } catch (error) {
    console.error("Error fetching purchase input by ID:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a Purchase Input
export const updatePurchaseInput = async (req, res) => {
  try {
    const { id } = req.params; // PurchaseInput ID to update
    const {
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      amountPaid,
      interest, // Added interest here as it might be updated
      cooperativeId, // ⭐ NEW: Expect cooperativeId for authorization
    } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase input ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ message: "Cooperative ID is required and must be valid." });
    }
    // Validate other IDs if they are provided for update
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId format." });
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid productId format." });
    if (seasonId && !mongoose.Types.ObjectId.isValid(seasonId)) return res.status(400).json({ message: "Invalid seasonId format." });

    // Fetch the old purchase, ensuring it belongs to the correct cooperative
    const oldPurchase = await PurchaseInput.findOne({ _id: id, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    if (!oldPurchase) {
      return res.status(404).json({ message: "Purchase input not found or unauthorized to update." });
    }

    // Determine new values, defaulting to old values if not provided in request
    const newQuantity = quantity !== undefined ? quantity : oldPurchase.quantity;
    const newUnitPrice = unitPrice !== undefined ? unitPrice : oldPurchase.unitPrice;
    const newAmountPaid = amountPaid !== undefined ? amountPaid : oldPurchase.amountPaid;
    const newInterest = interest !== undefined ? interest : oldPurchase.interest; // Use old interest if not provided

    // Validate new quantity/unitPrice/amountPaid
    if (newQuantity <= 0 || newUnitPrice <= 0 || newAmountPaid < 0) {
      return res.status(400).json({
        message:
          "Quantity and Unit Price must be positive, and amount paid cannot be negative.",
      });
    }

    const newTotalPrice = newUnitPrice * newQuantity;
    if (newAmountPaid > newTotalPrice) {
      return res
        .status(400)
        .json({ message: "Amount paid cannot exceed new total price." });
    }

    const newAmountRemaining = newTotalPrice - newAmountPaid;

    // Calculate changes to stock and cash
    const quantityDifference = newQuantity - oldPurchase.quantity;
    const amountPaidDifference = newAmountPaid - oldPurchase.amountPaid;

    // Adjust stock (productId should be oldPurchase.productId, as we assume it's the same product)
    const stock = await Stock.findOne({ productId: oldPurchase.productId, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    if (stock) {
      // Ensure there's enough stock if quantity is increasing
      if (quantityDifference > 0 && stock.quantity < quantityDifference) {
        return res.status(400).json({ message: `Not enough stock to increase quantity by ${quantityDifference}.` });
      }
      stock.quantity -= quantityDifference; // Decreases if positive, increases if negative
      await stock.save();
    } else {
      console.error(`Stock for product ${oldPurchase.productId} not found in cooperative ${cooperativeId}.`);
      return res.status(404).json({ message: "Associated product stock not found." });
    }

    // Adjust cash
    let cash = await Cash.findOne({ cooperativeId: cooperativeId }); // ⭐ UPDATED: Find cash for specific cooperative
    if (cash) {
      cash.amount += amountPaidDifference; // Increases if positive, decreases if negative
      await cash.save();
    } else {
      console.error(`Cash document not found for cooperative ${cooperativeId}.`);
      return res.status(404).json({ message: "Associated cooperative cash account not found." });
    }

    let finalAmountRemaining = newAmountRemaining;
    let loanRevenue = 0;

    // Handle Loan updates
    if (newAmountRemaining > 0) {
      const loanInterestRate = newInterest / 100; // Use newInterest
      loanRevenue = newAmountRemaining * loanInterestRate;
      finalAmountRemaining = newAmountRemaining + loanRevenue;

      let loan = await Loan.findOne({ purchaseInputId: oldPurchase._id, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId

      if (loan) {
        // Update existing loan
        loan.amountOwed = finalAmountRemaining;
        loan.loanRevenue = loanRevenue;
        loan.interest = newInterest; // Update interest rate as well
        loan.status = "pending"; // Ensure status is pending if remaining amount is > 0
        await loan.save();
      } else {
        // Create new loan if one didn't exist but now there's an amount remaining
        await Loan.create({
          purchaseInputId: oldPurchase._id,
          userId: oldPurchase.userId, // Use original userId
          cooperativeId: cooperativeId, // ⭐ NEW: Include cooperativeId
          quantity: newQuantity, // Update quantity if relevant for loan model
          amountOwed: finalAmountRemaining,
          loanRevenue: loanRevenue,
          interest: newInterest,
          status: "pending",
        });
      }
    } else {
      // If no amount remaining, delete any existing loan for this purchase
      await Loan.findOneAndDelete({ purchaseInputId: oldPurchase._id, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    }

    const newStatus = finalAmountRemaining > 0 ? "loan" : "paid";

    // Update the PurchaseInput document itself
    const updatedPurchase = await PurchaseInput.findOneAndUpdate(
      { _id: id, cooperativeId: cooperativeId }, // ⭐ UPDATED: Query by ID and cooperativeId
      {
        userId: userId !== undefined ? userId : oldPurchase.userId,
        productId: productId !== undefined ? productId : oldPurchase.productId,
        seasonId: seasonId !== undefined ? seasonId : oldPurchase.seasonId,
        quantity: newQuantity,
        unitPrice: newUnitPrice,
        totalPrice: newTotalPrice,
        amountPaid: newAmountPaid,
        amountRemaining: finalAmountRemaining,
        status: newStatus,
        // cooperativeId remains the same
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    )
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName") // Updated to productName as per Product model
      .populate("seasonId", "name year")
      .populate("cooperativeId", "name registrationNumber"); // ⭐ NEW: Populate cooperative info

    res
      .status(200)
      .json({ message: "Purchase updated successfully", purchase: updatedPurchase });
  } catch (error) {
    console.error("Error updating purchase input:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a Purchase Input
export const deletePurchaseInput = async (req, res) => {
  try {
    const { id } = req.params; // PurchaseInput ID to delete
    const { cooperativeId } = req.body; // ⭐ NEW: Expect cooperativeId for authorization

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase input ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ message: "Cooperative ID is required and must be valid." });
    }

    // Find the purchase input, ensuring it belongs to the correct cooperative
    const purchase = await PurchaseInput.findOne({ _id: id, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    if (!purchase) {
      return res.status(404).json({ message: "Purchase input not found or unauthorized to delete." });
    }

    // Revert stock changes
    const stock = await Stock.findOne({ productId: purchase.productId, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId
    if (stock) {
      stock.quantity += purchase.quantity; // Add back the purchased quantity
      await stock.save();
    } else {
      console.warn(`Stock for product ${purchase.productId} not found in cooperative ${cooperativeId} during deletion cleanup.`);
      // Optionally, you might want to return an error or a partial success here
    }

    // Revert cash changes
    if (purchase.amountPaid > 0) {
      let cash = await Cash.findOne({ cooperativeId: cooperativeId }); // ⭐ UPDATED: Find cash for specific cooperative
      if (cash) {
        cash.amount -= purchase.amountPaid; // Subtract the amount paid
        await cash.save();
      } else {
        console.warn(`Cash document not found for cooperative ${cooperativeId} during deletion cleanup.`);
      }
    }

    // Delete associated loan (if any)
    await Loan.findOneAndDelete({ purchaseInputId: purchase._id, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId

    // Finally, delete the purchase input
    await PurchaseInput.findOneAndDelete({ _id: id, cooperativeId: cooperativeId }); // ⭐ UPDATED: Filter by cooperativeId

    res.status(200).json({ message: "Purchase deleted and related data adjusted successfully." });
  } catch (error) {
    console.error("Error deleting purchase input:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};