
import express from "express";
import { getCash } from "../controllers/cashController.js";


import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("query"),
  getCash
);

export default router;
