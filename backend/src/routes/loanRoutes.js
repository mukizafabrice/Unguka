import express from "express";
import {
  getAllLoans,
  getLoansByUserId,
  updateLoan,
  deleteLoan,
} from "../controllers/loanController.js";

const router = express.Router();

// Define routes for the loan API
router.get("/", getAllLoans);
router.get("/:userId", getLoansByUserId);
router.put("/:id", updateLoan);
router.delete("/:id", deleteLoan);

export default router;
