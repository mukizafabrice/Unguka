import express from "express";
import { getAllStocks, getTotalCash } from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getAllStocks); 
router.get("/cash", getTotalCash);

export default router;
