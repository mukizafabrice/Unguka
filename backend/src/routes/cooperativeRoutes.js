import express from "express";
import {
  createCooperative,
  getAllCooperatives,
  getCooperativeById,
  updateCooperative,
  deleteCooperative,
} from "../controllers/cooperativeController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router;
router
  .route("/")
  .post(protect, authorize("superadmin"), createCooperative)
  .get(protect, authorize("superadmin", "manager"), getAllCooperatives);

router
  .route("/:id")
  .get(protect, getCooperativeById)
  .put(protect, authorize("superadmin"), updateCooperative)
  .delete(protect, authorize("superadmin"), deleteCooperative);

export default router;
