import Sales from "../models/Sales.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";

//  CREATE SALE

export const createSales = async (req, res) => {
  try {
    const { stockId, seasonId, quantity, buyer, phoneNumber, paymentType } =
      req.body;

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
    if (!product || !product.unitPrice) {
      return res
        .status(404)
        .json({ message: "Product or unit price not found in stock" });
    }

    const totalPrice = quantity * product.unitPrice;

    // Check stock quantity
    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Update stock
    stock.quantity -= quantity;
    stock.totalPrice -= totalPrice;
    if (paymentType === "cash") {
      stock.cash += totalPrice;
    }
    await stock.save();

    // Create the sale
    const newSale = new Sales({
      stockId,
      seasonId,
      quantity,
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
        select: "name", // Only get season name
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

// 🔍 GET SALE BY ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id)
      .populate("productId", "name")
      .populate("seasonId", "name");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving sale", error: error.message });
  }
};

// ✏️ UPDATE SALE (Optional: Update quantity and recalculate)
export const updateSale = async (req, res) => {
  try {
    const { quantity, buyer, paymentType, status } = req.body;

    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Only allow updating limited fields
    if (quantity) sale.quantity = quantity;
    if (buyer) sale.buyer = buyer;
    if (paymentType) sale.paymentType = paymentType;
    if (status) sale.status = status;

    await sale.save();

    res.status(200).json({ message: "Sale updated", data: sale });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update sale", error: error.message });
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

    // Find the stock
    const stock = await Stock.findById(sale.stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Update cash in stock
    stock.cash += sale.totalPrice;
    await stock.save();

    // Update sale status to paid
    sale.status = "paid";
    await sale.save();

    res
      .status(200)
      .json({
        message: "Sale updated to paid and stock cash adjusted",
        data: sale,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  DELETE SALE
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete sale", error: error.message });
  }
};
