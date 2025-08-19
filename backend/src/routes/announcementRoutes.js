import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";
const router = express.Router();

router.post("/", protect, checkCooperativeAccess("body"), createAnnouncement);
router.get("/", protect, checkCooperativeAccess("query"), getAnnouncements);
router.get("/:id", protect, getAnnouncementById);
router.put("/:id", protect, updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

export default router;
