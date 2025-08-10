import express from "express";
import {
  processMemberPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentSummary,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/process", processMemberPayment);
router.get("/", getAllPayments);
router.get("/summary", getPaymentSummary);
router.get("/:userId", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
