import express from "express";
import { getCash } from "../controllers/cashController.js";

const router = express.Router();

router.get("/", getCash);

export default router;
