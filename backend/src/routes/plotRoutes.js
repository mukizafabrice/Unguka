import express from "express";
import {
  createPlot,
  getAllPlots,
  getPlotById,
  updatePlot,
  deletePlot,
} from "../controllers/plotController.js";

const router = express.Router();

// Create a new plot
router.post("/", createPlot);

// Get all plots
router.get("/", getAllPlots);

// Get one plot by ID
router.get("/:id", getPlotById);

// Update plot by ID
router.put("/:id", updatePlot);

// Delete plot by ID
router.delete("/:id", deletePlot);

export default router;
