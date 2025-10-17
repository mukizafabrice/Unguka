import express from "express";
import { getManagerReport, getMemberReport, downloadManagerReportWord, downloadMemberReportWord } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

// Manager Report - Get comprehensive cooperative data
router.get(
  "/manager",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("query"), // Ensure manager can only access their cooperative
  getManagerReport
);

// Member Report - Get personal activity data
router.get(
  "/member",
  protect,
  authorizeRoles(["member"]),
  getMemberReport
);

// Download Manager Report as Word document
router.get(
  "/manager/download-word",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("query"),
  downloadManagerReportWord
);

// Download Member Report as Word document
router.get(
  "/member/download-word",
  protect,
  authorizeRoles(["member"]),
  downloadMemberReportWord
);

export default router;