// src/routes/seasonRoutes.js
import express from "express";
import {
  createSeason,
  getAllSeasons,
  getSeasonById,
  updateSeason,
  deleteSeason,
} from "../controllers/seasonController.js"; // Ensure correct path to your controller

// Import your authentication and authorization middleware
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

// POST /api/seasons/register - Create a new season
router.post(
  "/register",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can create seasons
  checkCooperativeAccess("body"), // Ensure manager creates season for their own cooperative (cooperativeId in req.body)
  createSeason
);

router.get(
  "/",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager", "member"]), // All these roles can view seasons
  getAllSeasons
);

// GET /api/seasons/:id - Get a single season by ID
// Superadmins can view any season. Managers/Members can view seasons belonging to their cooperative.
router.get(
  "/:id",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager", "member"]), // All these roles can view
  checkCooperativeAccess("query"), // Ensure user has access to the cooperativeId in the query parameter for this season
  getSeasonById
);

// PUT /api/seasons/:id - Update a season by ID
router.put(
  "/:id",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can update seasons
  checkCooperativeAccess("body"), // Ensure manager updates season within their own cooperative (cooperativeId in req.body)
  updateSeason
);

// DELETE /api/seasons/:id - Delete a season by ID
router.delete(
  "/:id",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can delete seasons
  checkCooperativeAccess("body"), // Ensure manager deletes season within their own cooperative (cooperativeId in req.body)
  deleteSeason
);

export default router;
