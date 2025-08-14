import express from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
  getSalesByPhoneNumber,
  updateSale,
  updateSaleToPaid,
  deleteSale,
} from "../controllers/salesController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  createSale
);

router.get(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  getAllSales
);

router.get(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("query"),
  getSaleById
);

router.get(
  "/phone/:phoneNumber",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("query"),
  getSalesByPhoneNumber
);

router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  updateSale
);

router.patch(
  "/:id/pay",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  updateSaleToPaid
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"),
  deleteSale
);

export default router;
