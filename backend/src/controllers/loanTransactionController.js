import LoanTransaction from "../models/LoanTransaction.js";
import Loan from "../models/Loan.js";
import PurchaseInput from "../models/PurchaseInput.js";

export const getAllLoanTransactions = async (req, res) => {
  try {
    const transactions = await LoanTransaction.find()
      .populate({
        path: "loanId",
        select: "amountOwed status purchaseInputId",
        populate: {
          path: "purchaseInputId",
          select: "userId seasonId productId",
          populate: [
            { path: "userId", select: "names" },
            { path: "seasonId", select: "name year" },
            { path: "productId", select: "productName" },
          ],
        },
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
