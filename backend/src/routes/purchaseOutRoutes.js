import express from "express";
import {
  createPurchaseOut,
  getAllPurchaseOut,
  getPurchaseOutById,
  updatePurchaseOut,
  deletePurchaseOut,
} from "../controllers/purchaseOutController.js";

const router = express.Router();
router.post("/", createPurchaseOut);
router.get("/", getAllPurchaseOut);
router.get("/:id", getPurchaseOutById);
router.put("/:id", updatePurchaseOut);
router.delete("/:id", deletePurchaseOut);

export default router;
