import express from "express";
import {
  createPurchaseInput,
  getAllPurchaseInputs,
  getPurchaseInputById,
  updatePurchaseInput,
  deletePurchaseInput,
} from "../controllers/purchaseInputController.js";

const router = express.Router();

router.post("/", createPurchaseInput);
router.get("/", getAllPurchaseInputs);
router.get("/:id", getPurchaseInputById);
router.put("/:id", updatePurchaseInput);
router.delete("/:id", deletePurchaseInput);

export default router;
