import Sales from "../models/Sales.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js";

//  CREATE SALE
export const createSales = async (req, res) => {
  try {
    const {
      stockId,
      seasonId,
      quantity,
      unitPrice,
      buyer,
      phoneNumber,
      paymentType,
    } = req.body;

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer" });
    }

    // Find the stock
    const stock = await Stock.findById(stockId).populate("productId");
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const product = stock.productId;
    if (!product) {
      return res.status(404).json({ message: "Product not found in stock" });
    }

    const totalPrice = quantity * unitPrice;

    // Check stock quantity
    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Update stock quantity and totalPrice
    stock.quantity -= quantity;
    stock.totalPrice -= totalPrice;
    await stock.save();

    // Update cash if payment is made
    if (paymentType === "cash") {
      const cash = await Cash.findOne();
      if (!cash) {
        return res.status(404).json({ message: "Cash record not found" });
      }
      cash.amount += totalPrice;
      await cash.save();
    }

    // Create the sale
    const newSale = new Sales({
      stockId,
      seasonId,
      quantity,
      unitPrice,
      totalPrice,
      buyer,
      phoneNumber,
      paymentType,
      status: paymentType === "cash" ? "paid" : "unpaid",
    });

    await newSale.save();

    res.status(201).json({
      message: "Sale created successfully",
      data: newSale,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//  GET ALL SALES

export const getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find()
      .populate({
        path: "stockId",
        populate: {
          path: "productId",
          select: "productName", // Only get product name
        },
        select: "productId", // Optionally limit other stock fields
      })
      .populate({
        path: "seasonId",
        select: "name year", // Only get season name
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sales retrieved successfully",
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔍 GET SALE BY ID

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findById(id)
      .populate({
        path: "stockId",
        populate: [
          { path: "seasonId", select: "seasonName" },
          { path: "productId", select: "productName" },
        ],
      })
      .populate({
        path: "userId",
        select: "phoneNumber",
      });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({
      message: "Sale retrieved successfully",
      data: sale,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔍 GET SALE BY PHONE NUMBER
export const getSalesByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const sales = await Sales.find({ phoneNumber })
      .populate({
        path: "stockId",
        populate: {
          path: "productId",
          select: "ProductName",
        },
        select: "productId",
      })
      .populate({
        path: "seasonId",
        select: "name",
      })
      .sort({ createdAt: -1 });

    if (!sales.length) {
      return res
        .status(404)
        .json({ message: "No sales found for this phone number" });
    }

    res.status(200).json({
      message: "Sales retrieved successfully",
      data: sales,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  UPDATE SALE
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const sale = await Sales.findById(id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const stock = await Stock.findById(sale.stockId).populate("productId");
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const product = stock.productId;
    if (!product || !product.unitPrice) {
      return res
        .status(404)
        .json({ message: "Product not found or missing unitPrice" });
    }

    // If quantity is updated
    if (updates.quantity !== undefined) {
      if (!Number.isInteger(updates.quantity) || updates.quantity < 1) {
        return res
          .status(400)
          .json({ message: "Quantity must be a positive integer" });
      }

      const oldQuantity = sale.quantity;
      const oldTotalPrice = sale.totalPrice;

      const newTotalPrice = updates.quantity * product.unitPrice;

      const quantityDiff = updates.quantity - oldQuantity;

      if (quantityDiff > 0 && stock.quantity < quantityDiff) {
        return res
          .status(400)
          .json({ message: "Not enough stock to increase sale quantity" });
      }

      stock.quantity -= quantityDiff;
      stock.totalPrice -= newTotalPrice - oldTotalPrice;

      await stock.save();

      updates.totalPrice = newTotalPrice;
    }

    // Update paymentType and status if provided
    if (updates.paymentType) {
      updates.status = updates.paymentType === "cash" ? "paid" : "unpaid";
    }

    const updatedSale = await Sales.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  UPDATE SALE TO PAID

export const updateSaleToPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findById(id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.status === "paid") {
      return res
        .status(400)
        .json({ message: "Sale is already marked as paid" });
    }

    // Find the cash document (assuming only one document exists)
    const cash = await Cash.findOne();
    if (!cash) {
      return res.status(404).json({ message: "Cash record not found" });
    }

    // Add sale's totalPrice to cash.amount
    cash.amount += sale.totalPrice;
    await cash.save();

    // Update sale status to paid
    sale.status = "paid";
    await sale.save();

    res.status(200).json({
      message: "Sale updated to paid and cash amount updated",
      data: sale,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Only adjust cash if sale was paid
    if (sale.status === "paid") {
      // Assuming you have a single cash record
      const cashRecord = await Cash.findOne();
      if (!cashRecord) {
        return res.status(500).json({ message: "Cash record not found" });
      }

      // Deduct sale totalPrice from cash amount
      cashRecord.amount -= sale.totalPrice;
      if (cashRecord.amount < 0) cashRecord.amount = 0; // Prevent negative cash

      await cashRecord.save();
    }

    // Delete the sale
    await Sales.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Sale deleted and cash updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete sale", error: error.message });
  }
};
