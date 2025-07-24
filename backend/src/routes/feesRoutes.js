import express from "express";
import {
  createFee,
  getAllFees,
  getFeesByPhoneNumber,
  getFeeById,
  updateFeeStatusToPaid,
  deleteFee,
} from "../controllers/feesController.js";

const router = express.Router();

router.post("/", createFee);
router.get("/", getAllFees);
router.get("/:id", getFeeById);
router.get("/user/phone/:phoneNumber", getFeesByPhoneNumber);
router.put("/:id/pay", updateFeeStatusToPaid);
router.delete("/:id", deleteFee);

export default router;
