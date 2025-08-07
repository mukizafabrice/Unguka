import PurchaseOut from "../models/PurchaseOut.js";
import Stock from "../models/Stock.js";
import Cash from "../models/Cash.js"; // ✅ Import it

export const createPurchaseOut = async (req, res) => {
  const { productId, seasonId, quantity, unitPrice } = req.body;

  try {
    const totalPrice = unitPrice * quantity;

    // 1. Create new purchase out record
    const newPurchaseOut = new PurchaseOut({
      productId,
      seasonId,
      quantity,
      unitPrice,
      totalPrice,
    });
    await newPurchaseOut.save();

    // 2. Find or create stock
    let stock = await Stock.findOne({ productId });

    if (stock) {
      stock.quantity += quantity;
      stock.totalPrice += totalPrice;
    } else {
      stock = new Stock({
        productId,
        quantity,
        totalPrice,
      });
    }
    await stock.save();

    // 3. Update cash
    const existingCash = await Cash.findOne();
    if (existingCash.amount > totalPrice) {
      existingCash.amount -= totalPrice;
      await existingCash.save();
    } else {
      res.status(400).json({ message: "Insufficient cash balance" });
      return;
    }

    res.status(201).json({
      message: "Purchase out created and stock updated successfully",
      data: newPurchaseOut,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// getAllPurchaseOut
export const getAllPurchaseOut = async (req, res) => {
  try {
    const purchases = await PurchaseOut.find()
      .populate("productId", "productName")
      .populate("seasonId", "year name")
      .sort({ createdAt: -1 });
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPurchaseOutById = async (req, res) => {
  const { id } = req.params;

  try {
    const purchase = await PurchaseOut.findById(id).populate(
      "productId",
      "productName"
    );
    if (!purchase) {
      return res.status(404).json({ message: "PurchaseOut not found" });
    }
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if the production already exists

export const updatePurchaseOut = async (req, res) => {
  const { id } = req.params;
  const { productId, seasonId, quantity, unitPrice } = req.body;

  try {
    const oldPurchase = await PurchaseOut.findById(id);
    if (!oldPurchase) {
      return res.status(404).json({ message: "PurchaseOut not found" });
    }

    const oldTotal = oldPurchase.totalPrice;
    const newTotal = quantity * unitPrice;

    // 1. Adjust stock: remove old, add new
    const stock = await Stock.findOne({ productId });
    if (stock) {
      stock.quantity = stock.quantity - oldPurchase.quantity + quantity;
      stock.totalPrice = stock.totalPrice - oldTotal + newTotal;
      await stock.save();
    }

    // 2. Adjust cash: refund old, subtract new
    const cash = await Cash.findOne();
    if (cash) {
      cash.amount = cash.amount + oldTotal - newTotal;
      await cash.save();
    }

    // 3. Update purchase out
    const updatedPurchase = await PurchaseOut.findByIdAndUpdate(
      id,
      {
        productId,
        seasonId,
        quantity,
        unitPrice,
        totalPrice: newTotal,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "PurchaseOut updated successfully with stock & cash adjusted",
      data: updatedPurchase,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// deletePurchaseOut

export const deletePurchaseOut = async (req, res) => {
  const { id } = req.params;

  try {
    const purchase = await PurchaseOut.findById(id);
    if (!purchase) {
      return res.status(404).json({ message: "PurchaseOut not found" });
    }

    const stock = await Stock.findOne({ productId: purchase.productId });
    if (stock) {
      stock.quantity -= purchase.quantity;
      stock.totalPrice -= purchase.totalPrice;
      await stock.save();
    }

    const cash = await Cash.findOne();
    if (cash) {
      cash.amount += purchase.totalPrice;
      await cash.save();
    }

    await PurchaseOut.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "PurchaseOut deleted and stock/cash adjusted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
