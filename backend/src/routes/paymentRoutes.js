import express from "express";
import {
  processMemberPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentSummary,
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
router.get("/", authorizeRoles(["superadmin", "manager"]), getAllPayments);
router.get(
  "/summary",
  authorizeRoles(["manager", "superadmin", "member"]),
  getPaymentSummary
);
router.get("/:userId", getPaymentById);

router.put("/:id", authorizeRoles("manager"), updatePayment);
router.delete("/:id", authorizeRoles("manger"), deletePayment);

export default router;
