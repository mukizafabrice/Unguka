import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


//register a new user
export const registerUser = async (req, res) => {
  const { names, phoneNumber, nationalId, role } = req.body;
  const defaultPass = "123";
  try {
    // Check if user already exists
    const existingUser = await User.find({
      $or: [{ phoneNumber }, { nationalId }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultPass, 10);
    // Create new user
    const newUser = new User({
      names,
      password: hashedPassword,
      phoneNumber,
      nationalId,
      role: role || "farmer", // Default to 'farmer' if no role is provided
    });
    // Save user to the database
    await newUser.save();
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        names: newUser.names,
        phoneNumber: newUser.phoneNumber,
        nationalId: newUser.nationalId,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
