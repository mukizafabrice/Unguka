import express from "express";
import { getAllPaymentTransactions } from "../controllers/paymentTransactionController.js";

const router = express.Router();

router.get("/", getAllPaymentTransactions);

export default router;
