// routes/userRoutes.js

import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeProfileImage,
} from "../controllers/userController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });
router.post("/register", registerUser);
router.post("/login", loginUser);

// User retrieval
router.get("/", getAllUsers);
router.get("/user/:id", getUserById);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Profile picture update
router.put(
  "/user/:id/profile",
  upload.single("profilePicture"),
  changeProfileImage
);

export default router;
