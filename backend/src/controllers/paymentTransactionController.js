import PaymentTransaction from "../models/PaymentTransaction.js";
import mongoose from "mongoose"; // Needed for mongoose.Types.ObjectId.isValid

export const getAllPaymentTransactions = async (req, res) => {
  try {
    const requestingUser = req.user;

    if (requestingUser.role === "superadmin") {
      const PaymentTransactions = await PaymentTransaction.find()
        .populate("cooperativeId", "name")
        .populate("paymentId", "status")
        .populate("userId", "names");
      return res.status(200).json(PaymentTransactions);
    }

    if (requestingUser.role === "manager") {
      const PaymentTransactions = await PaymentTransaction.find({
        cooperativeId: requestingUser.cooperativeId,
      })
        .populate("cooperativeId", "name")
        .populate("userId", "names")
        .populate("paymentId", "status")
        .sort({ createdAt: -1 });
      return res.status(200).json(PaymentTransactions);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllPaymentTransactionsById = async (req, res) => {
  const { userId } = req.params;

  // Defensive check for req.user before destructuring
  if (!userId) {
    return res.status(401).json({
      message: "User is needed",
    });
  }

  try {
    const PaymentTransactions = await PaymentTransaction.find({ userId })
      .populate("userId", "names")
      .populate("paymentId", "status")
      .sort({ transactionDate: -1 });
    res.status(200).json(PaymentTransactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
