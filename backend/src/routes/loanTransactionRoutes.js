import express from "express";
import {
  getAllLoanTransactions,
  getAllLoanTransactionsByUserId,
} from "../controllers/loanTransactionController.js";

const router = express.Router();

router.get("/", getAllLoanTransactions);
router.get("/:userId", getAllLoanTransactionsByUserId);
// router.get("/:id", getLoanTransactionById);
// router.put("/:id", updateLoanTransaction);
// router.delete("/:id", deleteLoanTransaction);

export default router;
