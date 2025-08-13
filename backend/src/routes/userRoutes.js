import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
  changeProfileImage,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.patch("/:id/change-password", protect, changePassword);
router.patch(
  "/:id/profile-image",
  protect,
  upload.single("profilePicture"),
  changeProfileImage
);
router.delete("/:id", protect, deleteUser);

export default router;
