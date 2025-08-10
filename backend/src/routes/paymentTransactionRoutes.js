import express from "express";
import {
  getAllPaymentTransactions,
  getAllPaymentTransactionsById,
} from "../controllers/paymentTransactionController.js";

const router = express.Router();

router.get("/", getAllPaymentTransactions);
router.get("/:userId", getAllPaymentTransactionsById);

export default router;
