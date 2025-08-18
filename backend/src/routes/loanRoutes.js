import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} from "../controllers/loanController.js";

const router = express.Router();

// A single route for creating a loan, accessible only to managers.
// The `cooperativeId` is handled by the backend.
router.post("/", protect, authorizeRoles(["manager"]), createLoan);

// Get all loans for the logged-in user's cooperative.
router.get(
  "/",
  protect,
  authorizeRoles(["manager", "superadmin"]),
  getAllLoans
);

// Get a specific loan by ID. Access is restricted to members, managers, and superadmins,
// but the controller ensures they can only view loans within their cooperative.
router.get(
  "/:id",
  protect,
  authorizeRoles(["member", "manager", "superadmin"]),
  getLoanById
);

// Update a loan, restricted to managers.
router.put("/:id", protect, authorizeRoles(["manager"]), updateLoan);

// Delete a loan, restricted to managers.
router.delete("/:id", protect, authorizeRoles(["manager"]), deleteLoan);

export default router;
