// src/routes/cashRoutes.js
import express from "express";
import { getCash } from "../controllers/cashController.js"; // Ensure correct path to your controller

// Import your authentication and authorization middleware
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

// GET /api/cash - Get cash balance for a specific cooperative
// This route is accessible to superadmins, managers, and members.
// It requires a 'cooperativeId' in the query parameters.
router.get(
  "/",
  protect, // Ensures the user is authenticated
  authorizeRoles(["superadmin", "manager", "member"]), // Only these roles can view cash
  checkCooperativeAccess("query"), // Ensures the user has access to the requested cooperativeId in query
  getCash
);

export default router;
