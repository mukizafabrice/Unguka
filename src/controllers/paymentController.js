import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import Stock from "../models/Stock.js";

//create payment
export const createPayment = async (req, res) => {
  try {
    const { productionId, amount } = req.body;

    // Validate required fields
    if (!productionId || amount == null) {
      return res
        .status(400)
        .json({ message: "productionId and amount are required" });
    }

    // Get the production to find associated stock
    const production = await Production.findById(productionId);
    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    // Get stock using seasonId and productId from production
    const stock = await Stock.findOne({
      seasonId: production.seasonId,
      productId: production.productId,
    });

    if (!stock) {
      return res.status(404).json({ message: "Related stock not found" });
    }

    // Check if stock has enough cash
    if (stock.cash < amount) {
      return res.status(400).json({ message: "Insufficient cash in stock" });
    }

    // Create payment
    const newPayment = new Payment({ productionId, amount });
    await newPayment.save();

    // Subtract amount from stock cash
    stock.cash -= amount;
    await stock.save();

    res.status(201).json({
      message: "Payment added and stock updated successfully",
      data: newPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "productionId",
      populate: [
        { path: "seasonId", select: "seasonName" },
        { path: "productId", select: "productName" },
        { path: "userId", select: "names phoneNumber" },
      ],
    });

    res.status(200).json({ message: "Payments retrieved", data: payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get payment by id

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "productionId",
      populate: [
        { path: "seasonId", select: "seasonName" },
        { path: "productId", select: "productName" },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment found", data: payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get payments by phone number

export const getPaymentsByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Step 1: Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Find productions for this user
    const productions = await Production.find({ userId: user._id }).select(
      "_id"
    );
    if (!productions.length) {
      return res
        .status(404)
        .json({ message: "No productions found for this user" });
    }

    const productionIds = productions.map((prod) => prod._id);

    // Step 3: Find payments linked to those productions
    const payments = await Payment.find({
      productionId: { $in: productionIds },
    }).populate({
      path: "productionId",
      populate: [
        { path: "userId", select: "name phoneNumber" },
        { path: "productId", select: "name" },
        { path: "seasonId", select: "name" },
      ],
    });

    res
      .status(200)
      .json({ message: "Payments fetched successfully", data: payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//update by id

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const production = await Production.findById(payment.productionId);
    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    const stock = await Stock.findOne({
      seasonId: production.seasonId,
      productId: production.productId,
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const oldAmount = payment.amount;
    const diff = amount - oldAmount;

    // If difference is positive, we're increasing payment — reduce stock
    // If negative, we're decreasing payment — increase stock
    if (stock.cash < diff) {
      return res
        .status(400)
        .json({ message: "Insufficient cash in stock for this update" });
    }

    stock.cash -= diff;
    await stock.save();

    payment.amount = amount;
    await payment.save();

    res
      .status(200)
      .json({ message: "Payment updated successfully", data: payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const production = await Production.findById(payment.productionId);
    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    const stock = await Stock.findOne({
      seasonId: production.seasonId,
      productId: production.productId,
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    stock.cash += payment.amount;
    await stock.save();

    await Payment.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Payment deleted and stock refunded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
