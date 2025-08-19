import express from "express";
import {
  getAllPaymentTransactions,
  getAllPaymentTransactionsById,
} from "../controllers/paymentTransactionController.js";
// --- Import your security middlewares ---
import { protect } from "../middleware/authMiddleware.js"; // Adjust path as needed
import { authorizeRoles } from "../middleware/roleMiddleware.js"; // Adjust path as needed
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js"; // Adjust path as needed

const router = express.Router();
router.get("/", protect, getAllPaymentTransactions);

router.get("/:userId", protect, getAllPaymentTransactionsById);

export default router;
