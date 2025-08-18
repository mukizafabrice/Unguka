import express from "express";
import {
  createProduction,
  getAllProductions,
  getProductions,
  getProductionsByUserId,
  updateProduction,
  deleteProduction,
} from "../controllers/productionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  protect,
  authorizeRoles(["manager"]),
  checkCooperativeAccess("body"),
  createProduction
);

router.get(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  getAllProductions
);

router.get(
  "/by-user-season",
  protect,
  authorizeRoles(["member", "manager"]),
  checkCooperativeAccess("query"),
  getProductions
);

router.get(
  "/by-user/:id",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("query"),
  getProductionsByUserId
);

router.put(
  "/:id",
  protect,
  authorizeRoles(["manager"]),
  checkCooperativeAccess("body"),
  updateProduction
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["manager"]),
  checkCooperativeAccess("body"),
  deleteProduction
);

export default router;
