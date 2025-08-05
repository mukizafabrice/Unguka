import Production from "../models/Production.js";
import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";

// export const createProduction = async (req, res) => {
//   try {
//     const { userId, productId, seasonId, quantity } = req.body;

//     // 1. Find product and get its unit price
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const unitPrice = product.unitPrice;
//     const totalPrice = unitPrice * quantity;

//     // 2. Create new production record
//     const newProduction = new Production({
//       userId,
//       productId,
//       seasonId,
//       quantity,
//       totalPrice,
//     });

//     await newProduction.save();

//     // 3. Update or create stock
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

//     res.status(201).json({
//       message: "Production created and stock updated successfully",
//       data: newProduction,
//     });
//   } catch (error) {
//     console.error("Error in createProduction:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const createProduction = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, unitPrice } = req.body;

    const totalPrice = quantity * unitPrice;

    // 3. Save new production
    const newProduction = new Production({
      userId,
      productId,
      seasonId,
      quantity,
      unitPrice,
      totalPrice,
    });

    await newProduction.save();

    // 4. Update stock (add to existing or create new)
    const existingStock = await Stock.findOne({ productId });

    if (existingStock) {
      existingStock.quantity += quantity;
      existingStock.totalPrice += totalPrice;
      await existingStock.save();
    } else {
      const newStock = new Stock({
        productId,
        quantity,
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all productions
export const getAllProductions = async (req, res) => {
  try {
    const productions = await Production.find()
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName")
      .populate("seasonId", "name");

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
      .sort({ createdAt: 1 });

    res.status(200).json(productions);
  } catch (error) {
    console.error("Error fetching productions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get one production by ID
export const getProductionById = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id)
      .populate("userId", "fullName")
      .populate("productId", "name")
      .populate("seasonId", "name");

    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    res.status(200).json(production);
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
