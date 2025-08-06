import PaymentTransaction from "../models/PaymentTransaction.js";

export const getAllPaymentTransactions = async (req, res) => {
  try {
    const paymentTransactions = await PaymentTransaction.find().populate({
      path: "paymentId",
      select: "amount userId seasonId",
      populate: [
        { path: "userId", select: "names" },
        { path: "seasonId", select: "name year" },
      ],
    });

    res.status(200).json(paymentTransactions);
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    res.status(500).json({ message: error.message });
  }
};
