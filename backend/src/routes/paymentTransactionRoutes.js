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

// Apply security middlewares to all payment transaction routes
// Order matters: protect -> authorizeRoles -> checkCooperativeAccess -> controller
router.get(
  "/",
  protect,
  authorizeRoles("superadmin", "manager", "member"), // Allow these roles to view all transactions (scoped by controller)
  checkCooperativeAccess, // Ensures user belongs to an active cooperative
  getAllPaymentTransactions
);

router.get(
  "/:userId",
  protect,
  authorizeRoles("superadmin", "manager", "member"), // Allow these roles to view by user ID (scoped by controller)
  checkCooperativeAccess, // Ensures user belongs to an active cooperative
  getAllPaymentTransactionsById
);

export default router;
