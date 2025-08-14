import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

import {
  borrowMoney,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} from "../controllers/loanController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles(["user", "manager"]),
  checkCooperativeAccess("body"),
  borrowMoney
);

router.get(
  "/",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  checkCooperativeAccess("query"),
  getAllLoans
);

router.get(
  "/:id",
  protect,
  authorizeRoles(["user", "manager", "superadmin"]),
  checkCooperativeAccess("query"),
  getLoanById
);

router.put(
  "/:id",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  checkCooperativeAccess("body"),
  updateLoan
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  checkCooperativeAccess("body"),
  deleteLoan
);

export default router;
