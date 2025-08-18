import LoanTransaction from "../models/LoanTransaction.js";


export const getAllLoanTransactions = async (req, res) => {
  const { cooperativeId } = req.user; // Get cooperativeId from the authenticated user

  try {
    const transactions = await LoanTransaction.find({ cooperativeId })
      .populate({
        path: "loanId",
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
  const { cooperativeId } = req.user; // Get cooperativeId from the authenticated user

  try {
    const transactions = await LoanTransaction.find({ cooperativeId })
      .populate({
        path: "loanId",
        // The match clause is now correctly filtering on the populated field.
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
