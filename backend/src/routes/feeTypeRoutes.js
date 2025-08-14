// src/routes/feeTypeRoutes.js
import express from "express";
import {
  createFeeType,
  getFeeTypes,
  getFeeTypeById,
  updateFeeType,
  deleteFeeType,
} from "../controllers/feeTypeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  createFeeType
);

router.get(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  getFeeTypes
);

router.get(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("query"),
  getFeeTypeById
);

router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  updateFeeType
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  deleteFeeType
);

export default router;
