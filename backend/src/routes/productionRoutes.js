import express from "express";
import {
  createProduction,
  getAllProductions,
  getProductions,
  getProductionsByUserId,
  updateProduction,
  deleteProduction,
} from "../controllers/productionController.js";

const router = express.Router();

router.post("/", createProduction);
router.get("/", getAllProductions);
router.get("/getProductions", getProductions);
router.get("/:id", getProductionsByUserId);
router.put("/:id", updateProduction);
router.delete("/:id", deleteProduction);

export default router;
