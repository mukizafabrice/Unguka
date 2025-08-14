import Sales from "../models/Sales.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js";
import Loan from "../models/Loan.js"; // Assuming you have a Loan model
import Product from "../models/Product.js"; // To populate product details via stock
import Season from "../models/Season.js"; // To populate season details
import mongoose from "mongoose";

// Helper function to format phone numbers (consistent with schema validation)
const isValidPhoneNumber = (phoneNumber) => {
  return /^(07[2-8]\d{7}|\+2507[2-8]\d{7})$/.test(phoneNumber);
};

// CREATE SALE
export const createSale = async (req, res) => { // Renamed from createSales for consistency
  const {
    stockId,
    seasonId,
    quantity,
    unitPrice,
    buyer,
    phoneNumber,
    paymentType,
    cooperativeId, // ⭐ NEW: Expect cooperativeId from request body
  } = req.body;

  try {
    // --- Input Validation and Type Conversion ---
    if (
      !mongoose.Types.ObjectId.isValid(stockId) ||
      !mongoose.Types.ObjectId.isValid(seasonId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId) // Validate cooperativeId
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID provided for stock, season, or cooperative." });
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (!Number.isFinite(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer." });
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice < 0) {
      return res.status(400).json({ success: false, message: "Unit Price must be a non-negative number." });
    }
    if (!buyer || buyer.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Buyer name is required." });
    }
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Valid phone number is required." });
    }
    if (!["cash", "loan"].includes(paymentType)) {
      return res.status(400).json({ success: false, message: "Invalid payment type. Must be 'cash' or 'loan'." });
    }
    // --- End of Input Validation ---

    const totalPrice = parsedQuantity * parsedUnitPrice;

    // 1. Verify stock exists for the given stockId and cooperativeId
    const stock = await Stock.findOne({ _id: stockId, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!stock) {
      return res.status(404).json({ success: false, message: "Stock record not found for this product in this cooperative." });
    }
    if (stock.quantity < parsedQuantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock quantity for this sale." });
    }

    // 2. Verify season exists for the given seasonId and cooperativeId
    const season = await Season.findOne({ _id: seasonId, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!season) {
      return res.status(404).json({ success: false, message: "Season not found in this cooperative." });
    }

    // 3. Create the new sales record
    const newSale = new Sales({
      stockId,
      seasonId,
      cooperativeId, // ⭐ NEW: Assign cooperativeId to the sale
      quantity: parsedQuantity,
      unitPrice: parsedUnitPrice,
      totalPrice,
      buyer: buyer.trim(),
      phoneNumber: phoneNumber.trim(),
      paymentType,
      status: paymentType === "cash" ? "paid" : "unpaid",
    });

    // Handle cash or loan payment
    if (paymentType === "cash") {
      // Assuming Cash model has a single record per cooperative or a global one.
      // If it's per cooperative, find/create for this cooperativeId.
      let cash = await Cash.findOne({ cooperativeId }); // ⭐ Filter by cooperativeId
      if (!cash) {
          // If no cash record for this cooperative, initialize it
          cash = new Cash({ cooperativeId, amount: 0 });
      }
      cash.amount += totalPrice; // Add money to cash
      await cash.save();
    } else if (paymentType === "loan") {
      // Create a loan record
      const newLoan = new Loan({
        userId: null, // As buyer is a string, not necessarily a registered user
        cooperativeId, // ⭐ Loan is tied to cooperative
        amount: totalPrice,
        status: "pending",
        description: `Loan for sale of ${parsedQuantity} units of ${stock.productId.productName} to ${buyer}`,
      });
      await newLoan.save();
    }

    // 4. Update stock: decrease quantity and total price
    stock.quantity -= parsedQuantity;
    stock.totalPrice -= totalPrice; // This assumes totalPrice on stock reflects remaining value
    await stock.save();

    await newSale.save(); // Save the new sale after all other operations are successful

    res.status(201).json({
      success: true,
      message: "Sale created and stock/cash/loan adjusted successfully",
      data: newSale,
    });
  } catch (error) {
    console.error("Error creating sale record:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all sales records
export const getAllSales = async (req, res) => {
  try {
    const { cooperativeId } = req.query; // ⭐ Get cooperativeId from query

    let query = {};
    if (cooperativeId) {
      query.cooperativeId = cooperativeId; // ⭐ Filter main sales query by cooperativeId
    }

    const sales = await Sales.find(query)
      .populate({
        path: 'stockId',
        select: 'productId quantity',
        populate: {
          path: 'productId',
          model: 'Product',
          select: 'productName'
        }
      })
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sales, message: "Sales records fetched successfully" });
  } catch (error) {
    console.error("Error fetching all sales records:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get a single sales record by ID
export const getSaleById = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.query; // ⭐ Get cooperativeId from query for authorization

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid sale ID format." });
    }
    if (cooperativeId && !mongoose.Types.ObjectId.isValid(cooperativeId)) { // Validate cooperativeId if provided
      return res.status(400).json({ success: false, message: "Invalid cooperative ID format." });
    }

    let query = { _id: id };
    if (cooperativeId) {
      query.cooperativeId = cooperativeId; // ⭐ Filter by cooperativeId
    }

    const sale = await Sales.findOne(query) // ⭐ Use findOne with the cooperativeId filter
      .populate({
        path: "stockId",
        populate: {
          path: "productId",
          select: "productName",
        },
        select: "productId",
      })
      .populate("seasonId", "name year"); // Populate season name and year

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found or unauthorized access." });
    }

    res.status(200).json({ success: true, data: sale, message: "Sale retrieved successfully" });
  } catch (error) {
    console.error("Error fetching sale record by ID:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format for sale or related document." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get sales by phone number
export const getSalesByPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.params;
  const { cooperativeId } = req.query; // ⭐ Get cooperativeId from query for authorization

  try {
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Valid phone number is required." });
    }
    if (cooperativeId && !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ success: false, message: "Invalid cooperative ID format." });
    }

    let query = { phoneNumber };
    if (cooperativeId) {
      query.cooperativeId = cooperativeId; // ⭐ Filter by cooperativeId
    }

    const sales = await Sales.find(query) // ⭐ Use the filtered query
      .populate({
        path: "stockId",
        populate: {
          path: "productId",
          select: "productName",
        },
        select: "productId",
      })
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 });

    if (!sales.length) {
      return res.status(404).json({ success: false, message: "No sales found for this phone number in this cooperative." });
    }

    res.status(200).json({ success: true, data: sales, message: "Sales retrieved successfully" });
  } catch (error) {
    console.error("Error fetching sales by phone number:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update a sale record
export const updateSale = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId, ...updates } = req.body; // ⭐ Get cooperativeId from body for authorization

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid sale ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ success: false, message: "Valid cooperative ID is required for update." });
    }

    const sale = await Sales.findOne({ _id: id, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found or unauthorized to update." });
    }

    const stock = await Stock.findOne({ _id: sale.stockId, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!stock) {
      // This scenario indicates a data inconsistency, but should ideally not happen if data integrity is maintained
      return res.status(404).json({ success: false, message: "Associated stock not found for this sale in this cooperative." });
    }

    // Initialize old values
    const oldQuantity = sale.quantity;
    const oldTotalPrice = sale.totalPrice;

    // Determine new quantity and calculate price difference
    let newQuantity = updates.quantity !== undefined ? Number(updates.quantity) : oldQuantity;
    let newUnitPrice = updates.unitPrice !== undefined ? Number(updates.unitPrice) : sale.unitPrice;

    if (!Number.isFinite(newQuantity) || !Number.isInteger(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer." });
    }
    if (!Number.isFinite(newUnitPrice) || newUnitPrice < 0) {
      return res.status(400).json({ success: false, message: "Unit Price must be a non-negative number." });
    }

    const newTotalPrice = newQuantity * newUnitPrice;
    const quantityDifference = newQuantity - oldQuantity;
    const priceDifference = newTotalPrice - oldTotalPrice;

    // Adjust stock quantity based on difference
    if (quantityDifference !== 0) {
      if (stock.quantity < quantityDifference) {
        return res.status(400).json({ success: false, message: "Not enough stock to increase sale quantity." });
      }
      stock.quantity -= quantityDifference;
    }

    // Adjust stock totalPrice based on difference
    if (priceDifference !== 0) {
        stock.totalPrice -= priceDifference;
    }

    // Update paymentType and status if provided
    if (updates.paymentType) {
      if (!["cash", "loan"].includes(updates.paymentType)) {
        return res.status(400).json({ success: false, message: "Invalid payment type. Must be 'cash' or 'loan'." });
      }
      // If payment type changes from loan to cash, adjust cash balance
      if (sale.paymentType === "loan" && updates.paymentType === "cash") {
        let cash = await Cash.findOne({ cooperativeId }); // ⭐ Filter by cooperativeId
        if (!cash) {
            cash = new Cash({ cooperativeId, amount: 0 }); // Initialize if not found
        }
        cash.amount += newTotalPrice; // Add full total price to cash
        await cash.save();
        sale.status = "paid"; // Mark as paid if payment type is now cash
      }
      // If payment type changes from cash to loan (less common for existing sales)
      if (sale.paymentType === "cash" && updates.paymentType === "loan") {
          let cash = await Cash.findOne({ cooperativeId });
          if (cash) {
              cash.amount -= oldTotalPrice; // Deduct old total price from cash
              await cash.save();
          }
          sale.status = "unpaid"; // Mark as unpaid
      }
      sale.paymentType = updates.paymentType;
    } else { // If paymentType is not updated, but quantity/unitPrice is, keep status consistent
        sale.status = sale.paymentType === "cash" ? "paid" : "unpaid";
    }

    // Apply updates to the sale object fields
    Object.assign(sale, updates);
    sale.quantity = newQuantity; // Ensure updated quantity is set
    sale.unitPrice = newUnitPrice; // Ensure updated unitPrice is set
    sale.totalPrice = newTotalPrice; // Ensure updated totalPrice is set

    // Validate phone number if updated
    if (updates.phoneNumber && !isValidPhoneNumber(updates.phoneNumber)) {
        return res.status(400).json({ success: false, message: "Valid phone number is required." });
    }

    await stock.save();
    await sale.save(); // Save the updated sale record

    res.status(200).json({
      success: true,
      message: "Sale updated and stock/cash/loan adjusted successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Error updating sale record:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update sale status to 'paid' (specifically for loan repayment)
export const updateSaleToPaid = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.body; // ⭐ Get cooperativeId from body

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid sale ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ success: false, message: "Valid cooperative ID is required." });
    }

    const sale = await Sales.findOne({ _id: id, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found or unauthorized to update." });
    }

    if (sale.status === "paid") {
      return res.status(400).json({ success: false, message: "Sale is already marked as paid." });
    }

    // Find the cash document for the cooperative
    let cash = await Cash.findOne({ cooperativeId }); // ⭐ Filter by cooperativeId
    if (!cash) {
        cash = new Cash({ cooperativeId, amount: 0 }); // Initialize if not found
    }

    // Add sale's totalPrice to cash.amount
    cash.amount += sale.totalPrice;
    await cash.save();

    // Update sale status to paid
    sale.status = "paid";
    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale updated to paid and cash amount updated.",
      data: sale,
    });
  } catch (error) {
    console.error("Error updating sale to paid:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a sale record
export const deleteSale = async (req, res) => {
  const { id } = req.params;
  const { cooperativeId } = req.body; // ⭐ Get cooperativeId from body for authorization

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid sale ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ success: false, message: "Valid cooperative ID is required for deletion." });
    }

    const sale = await Sales.findOne({ _id: id, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found or unauthorized to delete." });
    }

    // Find the associated stock
    const stock = await Stock.findOne({ _id: sale.stockId, cooperativeId }); // ⭐ Filter by cooperativeId
    if (!stock) {
        // Log this, but don't prevent deletion of the sale if stock is already gone (data inconsistency)
        console.warn(`Stock ID ${sale.stockId} not found for sale ${id}. Cannot revert stock changes.`);
    }

    // Only adjust cash if sale was paid
    if (sale.status === "paid") {
      let cashRecord = await Cash.findOne({ cooperativeId }); // ⭐ Filter by cooperativeId
      if (!cashRecord) {
        // If cash record is missing, it's a critical error unless you want to auto-create
        console.error("Cash record not found for cooperative. Cannot revert cash changes.");
        return res.status(500).json({ success: false, message: "Cash record not found for cooperative. Cannot complete deletion." });
      }

      // Deduct sale totalPrice from cash amount
      cashRecord.amount -= sale.totalPrice;
      if (cashRecord.amount < 0) cashRecord.amount = 0; // Prevent negative cash
      await cashRecord.save();
    }
    // If it was a loan, you might need to find and mark the corresponding loan as cancelled/deleted
    // This depends on your Loan model and how it references Sales.

    // Revert stock quantity and total price (if stock was found)
    if (stock) {
        stock.quantity += sale.quantity; // Add back quantity
        stock.totalPrice += sale.totalPrice; // Add back total value
        await stock.save();
    }

    // Delete the sale
    await Sales.findOneAndDelete({ _id: id, cooperativeId }); // ⭐ Use findOneAndDelete with cooperativeId

    res.status(200).json({
      success: true,
      message: "Sale deleted and related records adjusted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete sale record:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
