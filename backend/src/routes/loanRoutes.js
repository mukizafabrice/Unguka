import express from "express";
import {
  getAllLoans,
  updateLoan,
  deleteLoan,
  getLoansByPhoneNumber,
  markLoanAsRepaid,
} from "../controllers/loanController.js";

const router = express.Router();

router.get("/", getAllLoans);
router.put("/:id", markLoanAsRepaid);
router.get("/by-phone/:phoneNumber", getLoansByPhoneNumber);
router.put("/:id/repay", updateLoan);
router.delete("/:id", deleteLoan);

export default router;
