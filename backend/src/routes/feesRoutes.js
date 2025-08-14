// src/routes/feesRoutes.js
import express from "express";
import {
  recordPayment,
  getFeesByUserAndSeason,
  getAllFees,
  getAllFeesById, // Assuming this gets fees for a specific user by their ID
  updateFee,
  deleteFee,
} from "../controllers/feesController.js"; // Adjust path to your fees controllers as needed

// Import your authentication and authorization middleware
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();
router.post(
  "/record-payment",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  recordPayment
);

router.get(
  "/:cooperativeId/:userId/:seasonId",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("params"), // Expects cooperativeId from URL params
  getFeesByUserAndSeason
);

router.get(
  "/:cooperativeId",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("params"), // Expects cooperativeId from URL params
  getAllFees
);

router.get(
  "/user/:cooperativeId/:userId",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("params"), // Expects cooperativeId from URL params
  getAllFeesById
);

// PUT /api/fees/:id
// Allows managers and superadmins to update a specific fee record.
// cooperativeId for the fee being updated is typically in the request body.
router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"), // Expects cooperativeId in req.body
  updateFee
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"), // Expects cooperativeId in req.body
  deleteFee
);

export default router;
