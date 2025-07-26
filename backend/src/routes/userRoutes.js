import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  changeProfile,
} from "../controllers/userController.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/user/:id", getUserById);
router.put(
  "/users/:id/profile",
  upload.single("profilePicture"),
  changeProfile
);

export default router;
