import LoanTransaction from "../models/LoanTransaction.js";
import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";

export const getAllLoanTransactions = async (req, res) => {
  try {
    const transactions = await LoanTransaction.find()
      .populate({
        path: "loanId",
        select: "amountOwed status purchaseInputId userId",
        populate: [
          { path: "userId", select: "names" }, // First nested population
          {
            path: "purchaseInputId", // Second nested population
            select: "userId seasonId productId",
            populate: [
              { path: "userId", select: "names" },
              { path: "seasonId", select: "name year" },
              { path: "productId", select: "productName" },
            ],
          },
        ],
      })
      .sort({ transactionDate: -1 });

    res.status(200).json({
      message: "Loan transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching loan transactions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllLoanTransactionsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions = await LoanTransaction.find()
      .populate({
        path: "loanId",
        // This is the key change: the `match` clause filters the loans.
        match: { userId: userId },
        select: "amountOwed status purchaseInputId userId",
        populate: [
          { path: "userId", select: "names" },
          {
            path: "purchaseInputId",
            select: "userId seasonId productId",
            populate: [
              { path: "userId", select: "names" },
              { path: "seasonId", select: "name year" },
              { path: "productId", select: "productName" },
            ],
          },
        ],
      })
      .sort({ transactionDate: -1 });

    // After population, transactions that didn't match the userId will have a null `loanId`.
    // You need to filter these out.
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.loanId !== null
    );

    res.status(200).json({
      message: "Loan transactions fetched successfully",
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error("Error fetching loan transactions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
