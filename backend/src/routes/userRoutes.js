import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  updateAdmin,
  changePassword,
  deleteUser,
  changeProfileImage,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import path from "path";
const router = express.Router();

router.post(
  "/register",
  protect,
  authorize(["manager", "superadmin"]),
  registerUser
);

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/getUserByEmail", getUserByEmail);
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.patch("/:id/admin", updateAdmin);
router.put("/:id/change-password", changePassword);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // The directory to save the files
  },
  filename: (req, file, cb) => {
    // Create a unique filename with a timestamp and the original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Only images are allowed!");
  },
});

// Your router definition remains the same
router.put(
  "/:id/profile-image",
  upload.single("profilePicture"),
  changeProfileImage
);
router.delete("/:id", protect, deleteUser);

export default router;
