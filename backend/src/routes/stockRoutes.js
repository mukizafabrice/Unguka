// src/routes/stockRoutes.js
import express from "express";
import {
  createStock,
  getAllStocks,
  getStockById,
  updateStock,
  deleteStock,
} from "../controllers/stockController.js"; // Ensure correct path to your controller

// Import your authentication and authorization middleware
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();
router.post(
  "/register",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can create stock
  checkCooperativeAccess("body"), // Ensure manager creates stock for their own cooperative (cooperativeId in req.body)
  createStock
);

// GET /api/stocks - Get all stocks
// Superadmins can view all. Managers/Members can view stocks within their cooperative.
// The `getAllStocks` controller handles filtering by `cooperativeId` if provided in `req.query`.
router.get(
  "/",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager", "member"]), // All these roles can view stock
  getAllStocks
);

// GET /api/stocks/:id - Get a single stock entry by ID
// Superadmins can view any stock. Managers/Members can view stock belonging to their cooperative.
router.get(
  "/:id",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager", "member"]), // All these roles can view
  checkCooperativeAccess("query"), // Ensure user has access to the cooperativeId in the query parameter for this stock
  getStockById
);

// PUT /api/stocks/:id - Update a stock entry by ID
router.put(
  "/:id",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can update stock
  checkCooperativeAccess("body"), // Ensure manager updates stock within their own cooperative (cooperativeId in req.body)
  updateStock
);

// DELETE /api/stocks/:id - Delete a stock entry by ID
router.delete(
  "/:id",
  protect, // Ensure user is authenticated
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can delete stock
  checkCooperativeAccess("body"), // Ensure manager deletes stock within their own cooperative (cooperativeId in req.body)
  deleteStock
);

export default router;
