// Example of your routes
import express from "express"; // Your existing middleware

import {
  recordPayment,
  getFeesByUserAndSeason,
  getAllFees,
  getAllFeesById,
  updateFee,
  payFee,
  deleteFee,
} from "../controllers/feesController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";
const router = express.Router();

// Route to record a new payment
router.post(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  recordPayment
);

// Route to get all fees for a specific cooperative (managers/superadmins only)
// Note: The cooperativeId in params is now a hint, with the controller doing the final security check
router.get(
  "/:cooperativeId",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  getAllFees
);

// Get fees by user ID and a specific cooperative
router.get("/user/:userId", getAllFeesById);

// Get fees by user and season in a specific cooperative
router.get(
  "/:cooperativeId/user/:userId/season/:seasonId",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  getFeesByUserAndSeason
);

router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  updateFee
);
router.put(
  "/pay/:feeId",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  payFee
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  deleteFee
);

export default router;
