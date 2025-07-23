import express from "express";
import {
  createProduction,
  getAllProductions,
  getProductionById,
  updateProduction,
  deleteProduction,
} from "../controllers/productionController.js";

const router = express.Router();

router.post("/add", createProduction);
router.get("/", getAllProductions);
router.get("/:id", getProductionById);
router.put("/update/:id", updateProduction);
router.delete("/delete/:id", deleteProduction);

export default router;
