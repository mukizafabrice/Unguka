import express from "express";
import {
  createSeason,
  getAllSeasons,
  getSeasonById,
  updateSeason,
  deleteSeason,
} from "../controllers/seasonController.js";

const router = express.Router();

router.post("/create", createSeason);
router.get("/", getAllSeasons);
router.get("/:id", getSeasonById);
router.put("/update/:id", updateSeason);
router.delete("/delete/:id", deleteSeason);

export default router;
