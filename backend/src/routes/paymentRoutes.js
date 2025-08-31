// routes/paymentRoutes.js

import express from "express";
import {
  processMemberPayment,
  getAllPayments,
  getPaymentById,
  exportPaymentsToExcel,
  exportPaymentsToPDF,
  updatePayment,
  deletePayment,
  getPaymentSummary,
  getPaymentSummaryByUserId,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

// All routes require authentication & cooperative access
router.use(protect); // user must be logged in

router.post(
  "/process",
  authorizeRoles(["manager", "superadmin"]),
  processMemberPayment
);

router.get(
  "/summary",
  authorizeRoles(["manager", "superadmin", "member"]),
  getPaymentSummary
);

router.get("/details/:userId", getPaymentSummaryByUserId);

// Correctly reordered routes: Specific routes first
router.get(
  "/excel",
  authorizeRoles(["superadmin", "manager"]),
  exportPaymentsToExcel
);
router.get(
  "/pdf",
  authorizeRoles(["superadmin", "manager"]),
  exportPaymentsToPDF
);

// General routes last
router.get("/:id", getPaymentById); // Use a more descriptive parameter name like ':id' instead of ':userId' if it's the payment ID

router.put("/:id", authorizeRoles("manager"), updatePayment);
router.delete("/:id", authorizeRoles("manager"), deletePayment);

router.get("/", authorizeRoles(["superadmin", "manager"]), getAllPayments);

export default router;
