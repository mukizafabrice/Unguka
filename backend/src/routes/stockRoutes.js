import express from "express";
import { getAllStocks } from "../controllers/stockController.js";

const router = express.Router();

router.get("/with-product", getAllStocks);

export default router;
