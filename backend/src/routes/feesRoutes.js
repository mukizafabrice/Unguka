import express from "express";
import {
  createFee,
  getAllFees,
  getFeesByPhoneNumber,
  getFeeById,
  markFeeAsPaid,
  deleteFee,
} from "../controllers/feesController.js";

const router = express.Router();

router.post("/", createFee);
router.get("/", getAllFees);
router.get("/:id", getFeeById);
router.get("/user/phone/:phoneNumber", getFeesByPhoneNumber);
router.put("/pay/:id", markFeeAsPaid);
router.delete("/:id", deleteFee);

export default router;
