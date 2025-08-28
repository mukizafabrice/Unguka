import PaymentTransaction from "../models/PaymentTransaction.js";
import mongoose from "mongoose";

export const handlePaymentTransactions = async (req, res) => {
  const { paymentId } = req.params;

  try {
    if (paymentId) {
      // Logic for getting transactions by a specific paymentId
      if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        return res.status(400).json({
          message: "A valid payment ID is required.",
        });
      }

      const transactions = await PaymentTransaction.find({ paymentId })
        .populate("userId", "names")
        .populate("paymentId", "status")
        .sort({ transactionDate: -1 });

      return res.status(200).json(transactions);
    } else {
      // Logic for getting all transactions, regardless of user role
      const transactions = await PaymentTransaction.find()
        .populate("userId", "names")
        .populate("paymentId", "status")
        .sort({ createdAt: -1 });

      return res.status(200).json(transactions);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
