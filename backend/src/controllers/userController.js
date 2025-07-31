import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  const { names, phoneNumber, nationalId, role } = req.body;
  const defaultPass = "123"; // Consider changing this

  if (!names || !phoneNumber || !nationalId) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const cleanPhone = phoneNumber;
    const cleanNationalId = String(nationalId).trim();

    const existingUser = await User.findOne({
      $or: [{ phoneNumber: cleanPhone }, { nationalId: cleanNationalId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(defaultPass, 10);

    const newUser = new User({
      names: names,
      password: hashedPassword,
      phoneNumber: cleanPhone,
      nationalId: cleanNationalId,
      role: role || "member",
    });

    await newUser.save();

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

//login

export const loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        names: user.names,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all users

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update user

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { names, phoneNumber, nationalId, role } = req.body;
  if (!id || !names || !phoneNumber || !nationalId) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.names = names;
    user.phoneNumber = phoneNumber;
    user.nationalId = nationalId;
    user.role = role;
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        names: user.names,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeProfileImage = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded." });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.profilePicture = `/uploads/${req.file.filename}`;

    await user.save();

    res.status(200).json({
      message: "Profile image updated successfully!",
      user: {
        id: user._id,
        names: user.names,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
