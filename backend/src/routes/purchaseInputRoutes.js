// src/routes/purchaseInputRoutes.js
import express from "express";
import {
  createPurchaseInput,
  getAllPurchaseInputs,
  getPurchaseInputByUserId,
  updatePurchaseInput,
  deletePurchaseInput,
} from "../controllers/purchaseInputController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  createPurchaseInput
);

router.get(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  getAllPurchaseInputs
);

router.get("/:userId", protect, getPurchaseInputByUserId);

router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  updatePurchaseInput
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  deletePurchaseInput
);

export default router;
