import express from "express";
import {
  recordPayment,
  getFeesByUserAndSeason,
  getAllFees,
  getAllFeesById,
  updateFee,
  deleteFee,
} from "../controllers/feesController.js";

const router = express.Router();
router.post("/", recordPayment);
router.get("/user/:userId/season/:seasonId", getFeesByUserAndSeason);
router.get("/", getAllFees);
router.get("/:userId", getAllFeesById);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);

export default router;
