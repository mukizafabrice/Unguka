import express from "express";
import {
  createSales,
  getAllSales,
  getSaleById,
  updateSale,
  updateSaleToPaid,
  deleteSale,
  getSalesByPhoneNumber,
} from "../controllers/salesController.js";

const router = express.Router();

router.post("/", createSales);
router.get("/", getAllSales);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.put("/:id/pay", updateSaleToPaid);
router.delete("/:id", deleteSale);
router.get("/:phoneNumber", getSalesByPhoneNumber);

export default router;
