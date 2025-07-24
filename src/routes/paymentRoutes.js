import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByPhoneNumber,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.get("/phone/:phoneNumber", getPaymentsByPhoneNumber);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
