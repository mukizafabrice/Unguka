// backend/routes/purchaseOutRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // Assuming you have authentication middleware
import { authorizeRoles } from "../middleware/roleMiddleware.js"; // Assuming you have role-based authorization middleware
import {
  createPurchaseOut,
  getAllPurchaseOut,
  getPurchaseOutById,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../controllers/purchaseOutController.js";

const router = express.Router();

// Route to create a new purchase-out (e.g., manager adds goods out)
router.post(
  "/",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  createPurchaseOut
);

// Route to get all purchase-out records for the authenticated user's cooperative
router.get(
  "/",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  getAllPurchaseOut
);

// Route to get a single purchase-out record by ID for the authenticated user's cooperative
router.get(
  "/:id",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  getPurchaseOutById
);

// Route to update a purchase-out record
router.put(
  "/:id",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  updatePurchaseOut
);

// Route to delete a purchase-out record
router.delete(
  "/:id",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  deletePurchaseOut
);

export default router;
