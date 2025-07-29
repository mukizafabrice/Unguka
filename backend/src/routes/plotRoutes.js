import express from "express";
import {
  createPlot,
  getAllPlots,
  getPlotById,
  updatePlot,
  deletePlot,
} from "../controllers/plotController.js";

const router = express.Router();
router.post("/", createPlot);
router.get("/", getAllPlots);
router.get("/:id", getPlotById);
router.put("/:id", updatePlot);
router.delete("/:id", deletePlot);

export default router;
