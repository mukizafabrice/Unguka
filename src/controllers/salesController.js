import Sales from "../models/Sales.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";

//  CREATE SALE
export const createSales = async (req, res) => {
  try {
    const { productId, seasonId, quantity, buyer, paymentType } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.unitPrice) {
      return res
        .status(404)
        .json({ message: "Product or unit price not found" });
    }

    const totalPrice = quantity * product.unitPrice;

    const stock = await Stock.findOne({ productId });
    if (!stock) {
      return res
        .status(404)
        .json({ message: "Stock not found for this product" });
    }

    if (stock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    stock.quantity -= quantity;
    stock.totalPrice -= totalPrice;
    if (paymentType === "cash") {
      stock.cash += totalPrice;
    }
    await stock.save();

    const newSale = new Sales({
      productId,
      seasonId,
      quantity,
      totalPrice,
      buyer,
      paymentType,
      status: paymentType === "cash" ? "paid" : "unpaid",
    });

    await newSale.save();

    res.status(201).json({
      message: "Sale created successfully",
      data: newSale,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔍 GET ALL SALES
export const getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find()
      .populate("productId", "name")
      .populate("seasonId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
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
