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
    const { userId, productId, seasonId, quantity } = req.body;

    // 1. Check if this production already exists
    const existing = await Production.findOne({ userId, productId, seasonId });
    if (existing) {
      return res.status(400).json({
        message:
          "This farmer already registered this product in the same season.",
      });
    }

    // 2. Get unitPrice from Product model
    const product = await Product.findById(productId);
    if (!product || !product.unitPrice) {
      return res
        .status(404)
        .json({ message: "Product or unit price not found." });
    }

    const totalPrice = quantity * product.unitPrice;

    // 3. Save new production
    const newProduction = new Production({
      userId,
      productId,
      seasonId,
      quantity,
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
        cash: 0, // or you can leave cash untouched for now
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
      .populate("productId", "ProductName")
      .populate("seasonId", "name");

    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

// Update production
export const updateProduction = async (req, res) => {
  try {
    const updated = await Production.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Production not found" });
    }

    res.status(200).json({ message: "Production updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete production
export const deleteProduction = async (req, res) => {
  try {
    const deleted = await Production.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Production not found" });
    }

    res.status(200).json({ message: "Production deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
