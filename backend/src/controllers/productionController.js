import Production from "../models/Production.js";
import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";

export const createProduction = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, unitPrice } = req.body;

    // --- Input Validation and Type Conversion ---
    // Ensure IDs are valid Mongoose ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(seasonId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid ID provided for user, product, or season." });
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
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer." });
    }

    // Check if unitPrice is a finite positive number
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
      return res
        .status(400)
        .json({ message: "Unit Price must be a positive number." });
    }
    // --- End of Input Validation ---

    const totalPrice = parsedQuantity * parsedUnitPrice;

    // 3. Save new production
    const newProduction = new Production({
      userId,
      productId,
      seasonId,
      quantity: parsedQuantity, // Use the validated and parsed quantity
      unitPrice: parsedUnitPrice, // Use the validated and parsed unitPrice
      totalPrice,
    });

    await newProduction.save();

    // 4. Update stock (add to existing or create new)
    const existingStock = await Stock.findOne({ productId });

    if (existingStock) {
      // Ensure the addition doesn't result in overflow if numbers are extremely large
      existingStock.quantity = existingStock.quantity + parsedQuantity;
      existingStock.totalPrice = existingStock.totalPrice + totalPrice;
      await existingStock.save(); // This is where the validation error was likely occurring
    } else {
      const newStock = new Stock({
        productId,
        quantity: parsedQuantity, // Use the validated and parsed quantity
        totalPrice,
      });
      await newStock.save();
    }

    return res.status(201).json({
      message: "Production created and stock updated successfully",
      data: newProduction,
    });
  } catch (error) {
    console.error("Error creating production:", error);
    // Log specific Mongoose validation errors for better debugging
    if (error.name === "ValidationError") {
      console.error("Mongoose Validation Errors:", error.errors);
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const createProduction = async (req, res) => {
//   try {
//     const { userId, productId, seasonId, quantity, unitPrice } = req.body;

//     const totalPrice = quantity * unitPrice;

//     // 3. Save new production
//     const newProduction = new Production({
//       userId,
//       productId,
//       seasonId,
//       quantity,
//       unitPrice,
//       totalPrice,
//     });

//     await newProduction.save();

//     // 4. Update stock (add to existing or create new)
//     const existingStock = await Stock.findOne({ productId });

//     if (existingStock) {
//       existingStock.quantity += quantity;
//       existingStock.totalPrice += totalPrice;
//       await existingStock.save();
//     } else {
//       const newStock = new Stock({
//         productId,
//         quantity,
//         totalPrice,
//       });
//       await newStock.save();
//     }

//     return res.status(201).json({
//       message: "Production created and stock updated successfully",
//       data: newProduction,
//     });
//   } catch (error) {
//     console.error("Error creating production:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Get all productions
export const getAllProductions = async (req, res) => {
  try {
    const productions = await Production.find()
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name year")
      .sort({ createdAt: -1 });

    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductions = async (req, res) => {
  try {
    const { userId, seasonId } = req.query;

    if (!userId || !seasonId) {
      return res
        .status(400)
        .json({ message: "userId and seasonId are required" });
    }

    // This query finds productions that match BOTH the user and the season
    const productions = await Production.find({ userId, seasonId })
      .populate("userId", "names") // <-- ADD THIS LINE
      .populate("productId", "productName")
      .sort({ createdAt: -1 });

    res.status(200).json(productions);
  } catch (error) {
    console.error("Error fetching productions:", error);
    res.status(500).json({ message: "Server error" });
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
    const { productId, quantity, unitPrice } = req.body;

    const existing = await Production.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Production not found" });
    }

    const oldQuantity = existing.quantity;
    const oldTotal = existing.totalPrice;

    // If productId is changed, you'll need to handle more carefully
    if (productId.toString() !== existing.productId.toString()) {
      return res.status(400).json({
        message: "Changing the product of a production is not supported.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newTotal = quantity * unitPrice;

    // Update the production
    const updated = await Production.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        totalPrice: newTotal,
      },
      { new: true }
    );

    // Adjust stock
    const stock = await Stock.findOne({ productId });
    if (stock) {
      stock.quantity = stock.quantity - oldQuantity + quantity;
      stock.totalPrice = stock.totalPrice - oldTotal + newTotal;
      await stock.save();
    }

    res.status(200).json({ message: "Production updated", data: updated });
  } catch (error) {
    console.error("Error updating production:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduction = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id);
    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    // Adjust stock
    const stock = await Stock.findOne({ productId: production.productId });
    if (stock) {
      stock.quantity -= production.quantity;
      stock.totalPrice -= production.totalPrice;
      if (stock.quantity <= 0) {
        await stock.deleteOne(); // Optionally remove stock record if empty
      } else {
        await stock.save();
      }
    }

    // Delete production
    await Production.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Production deleted successfully" });
  } catch (error) {
    console.error("Error deleting production:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
