import express from "express";
import {
  getAllLoanTransactions,

} from "../controllers/loanTransactionController.js";

const router = express.Router();

router.get("/", getAllLoanTransactions);
// router.get("/:id", getLoanTransactionById);
// router.put("/:id", updateLoanTransaction);
// router.delete("/:id", deleteLoanTransaction);

export default router;
