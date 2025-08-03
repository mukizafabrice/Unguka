import express from "express";
import {
  recordPayment,
  getFeesByUserAndSeason,
  getAllFees,
  updateFee,
  deleteFee,
} from "../controllers/feesController.js";

const router = express.Router();

// Record or update payment
router.post("/", recordPayment);

// Get fees for a user in a season
router.get("/user/:userId/season/:seasonId", getFeesByUserAndSeason);

// Get all fees (admin)
router.get("/", getAllFees);

// Update a fee by ID
router.put("/:id", updateFee);

// Delete a fee by ID
router.delete("/:id", deleteFee);

export default router;
