import express from "express";
import { getAllStocks } from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getAllStocks);

export default router;
