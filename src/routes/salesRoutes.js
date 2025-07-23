import express from "express";
import {
  createSales,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/salesController.js";

const router = express.Router();

router.post("/", createSales);
router.get("/", getAllSales);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

export default router;
