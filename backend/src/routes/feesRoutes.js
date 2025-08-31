// 📂 routes/feesRoutes.js
import express from "express";
import {
  recordPayment,
  getFeesByUserAndSeason,
  getAllFees,
  getAllFeesById,
  exportFeesToExcel,
  exportFeesToPDF,
  updateFee,
  payFee,
  deleteFee,
} from "../controllers/feesController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all fees (manager/superadmin)
router.get(
  "/", // ⚠️ Removed :cooperativeId from the URL for security
  protect,
  authorizeRoles(["superadmin", "manager"]),
  getAllFees
);

// Get fees for a specific user and season
router.get(
  "/user/:userId/season/:seasonId",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  getFeesByUserAndSeason
);

// Get fees for a specific user
router.get(
  "/user/:userId",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]), // Added member role
  getAllFeesById
);

// Record a new payment
router.post(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  recordPayment
);

// Update a fee record
router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  updateFee
);

// Process a payment
router.put(
  "/pay/:feeId",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  payFee
);

// Delete a fee record
router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  deleteFee
);

// Export fees to Excel and PDF - These must be protected!
router.get(
  "/excel",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  exportFeesToExcel
);
router.get(
  "/pdf",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  exportFeesToPDF
);

export default router;
