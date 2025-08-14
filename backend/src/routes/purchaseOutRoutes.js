// src/routes/purchaseOutRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

import {
  createPurchaseOut,
  getAllPurchaseOut,
  getPurchaseOutById,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../controllers/purchaseOutController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles(["manager"]),
  checkCooperativeAccess("body"),
  createPurchaseOut
);

router.get(
  "/",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  checkCooperativeAccess("query"),
  getAllPurchaseOut
);

router.get(
  "/:id",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  checkCooperativeAccess("query"),
  getPurchaseOutById
);

router.put(
  "/:id",
  protect,
  authorizeRoles(["manager"]),
  checkCooperativeAccess("body"),
  updatePurchaseOut
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["manager"]),
  checkCooperativeAccess("body"),
  deletePurchaseOut
);

export default router;
