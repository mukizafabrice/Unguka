import express from "express";
import multer from "multer";
import { registerUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/userController.js";
import { getAllUsers } from "../controllers/userController.js";
import { updateUser } from "../controllers/userController.js";
import { deleteUser } from "../controllers/userController.js";
import { changeProfile } from "../controllers/userController.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/register", registerUser);
router.get("/login", loginUser);
router.get("/all", getAllUsers);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.put(
  "/users/:id/profile",
  upload.single("profilePicture"),
  changeProfile
);

export default router;
