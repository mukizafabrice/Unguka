import PaymentTransaction from "../models/PaymentTransaction.js";

export const getAllPaymentTransactions = async (req, res) => {
  try {
    const PaymentTransactions = await PaymentTransaction.find({})
      .populate("userId", "names")
      .sort({ transactionDate: -1 });

    res.status(200).json(PaymentTransactions);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
