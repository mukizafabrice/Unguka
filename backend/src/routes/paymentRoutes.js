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

// --- FIX: Change the order here ---
// Put the specific '/summary' route first
router.get("/summary", getPaymentSummary);

// Put the general '/:id' route after it
router.get("/:id", getPaymentById);
// ------------------------------------

router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
