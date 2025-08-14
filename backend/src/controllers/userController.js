import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fs from "fs";

export const registerUser = async (req, res) => {
  const { names, email, phoneNumber, nationalId, role, cooperativeId } =
    req.body;
  const defaultPass = "123";

  if (!names || !email || !phoneNumber || !nationalId) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const cleanPhone = phoneNumber;
    const cleanNationalId = String(nationalId).trim();

    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { phoneNumber: cleanPhone },
        { nationalId: cleanNationalId },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email, phone number, or national ID already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(defaultPass, 10);

    // Set cooperativeId conditionally based on the role
    const newUser = new User({
      names,
      email,
      password: hashedPassword,
      phoneNumber: cleanPhone,
      nationalId: cleanNationalId,
      role: role || "member",
      cooperativeId:
        role === "member" || role === "manager" ? cooperativeId : null,
    });

    // Validate that a cooperativeId is provided for non-superadmin roles
    if (
      (newUser.role === "member" || newUser.role === "manager") &&
      !newUser.cooperativeId
    ) {
      return res.status(400).json({
        message: "Cooperative ID is required for members and managers.",
      });
    }

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        cooperativeId: newUser.cooperativeId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        names: newUser.names,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        nationalId: newUser.nationalId,
        role: newUser.role,
        cooperativeId: newUser.cooperativeId,
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
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      message: "Please provide an email or phone number and a password",
    });
  }

  try {
    // Determine if the identifier is an email or phone number
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Include role and cooperativeId in the JWT payload
    const token = jwt.sign(
      { id: user._id, role: user.role, cooperativeId: user.cooperativeId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        names: user.names,
        email: user.email,
        phoneNumber: user.phoneNumber,
        nationalId: user.nationalId,
        role: user.role,
        cooperativeId: user.cooperativeId,
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

// ... (imports)

export const getAllUsers = async (req, res) => {
  try {
    const requestingUser = req.user; // Assumes authentication middleware is in place

    if (requestingUser.role === "superadmin") {
      const users = await User.find().populate("cooperativeId", "name");
      return res.status(200).json(users);
    }

    if (requestingUser.role === "manager") {
      const users = await User.find({
        cooperativeId: requestingUser.cooperativeId,
      }).populate("cooperativeId", "name");
      return res.status(200).json(users);
    }

    // Members should not have access
    return res.status(403).json({ message: "Access denied." });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get user by ID
// ... (imports)

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user; // Assumes authentication middleware is in place

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(id)
      .select("-password")
      .populate("cooperativeId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the requesting user is allowed to view this user
    const isSuperadmin = requestingUser.role === "superadmin";
    const isSameCooperative =
      requestingUser.cooperativeId &&
      user.cooperativeId &&
      requestingUser.cooperativeId.toString() === user.cooperativeId.toString();

    if (!isSuperadmin && !isSameCooperative) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete user
// ... (imports)

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization logic
    if (requestingUser.role === "superadmin") {
      // Superadmin can delete anyone
      if (
        userToDelete.role === "superadmin" &&
        requestingUser.id !== userToDelete.id
      ) {
        return res
          .status(403)
          .json({ message: "Superadmins cannot delete other superadmins." });
      }
    } else if (
      requestingUser.role === "manager" &&
      requestingUser.cooperativeId.toString() ===
        userToDelete.cooperativeId.toString()
    ) {
      // Manager can delete members in their cooperative, but not other managers or superadmins
      if (
        userToDelete.role === "manager" ||
        userToDelete.role === "superadmin"
      ) {
        return res.status(403).json({
          message: "Managers cannot delete other managers or superadmins.",
        });
      }
    } else {
      // Any other role, or manager trying to delete from another cooperative
      return res.status(403).json({ message: "Access denied." });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//update user

// ... (imports)

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { names, email, phoneNumber, nationalId, role, cooperativeId } =
    req.body;
  const requestingUser = req.user;

  if (!id || !names || !email || !phoneNumber || !nationalId) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization logic
    if (requestingUser.role === "superadmin") {
      // Superadmin can update anything
      if (role) userToUpdate.role = role;
      if (cooperativeId) userToUpdate.cooperativeId = cooperativeId;
    } else if (
      requestingUser.role === "manager" &&
      requestingUser.cooperativeId.toString() ===
        userToUpdate.cooperativeId.toString()
    ) {
      // Manager can only update members in their own cooperative
      if (userToUpdate.role !== "member") {
        return res
          .status(403)
          .json({ message: "Managers can only update member accounts." });
      }
      // Prevent manager from changing the role or cooperative of a user
      if (
        role !== userToUpdate.role ||
        cooperativeId !== userToUpdate.cooperativeId
      ) {
        return res.status(403).json({
          message:
            "Managers cannot change user roles or cooperative assignments.",
        });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    // Update fields
    userToUpdate.names = names;
    userToUpdate.email = email;
    userToUpdate.phoneNumber = phoneNumber;
    userToUpdate.nationalId = nationalId;

    await userToUpdate.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: userToUpdate._id,
        names: userToUpdate.names,
        email: userToUpdate.email,
        phoneNumber: userToUpdate.phoneNumber,
        nationalId: userToUpdate.nationalId,
        role: userToUpdate.role,
        cooperativeId: userToUpdate.cooperativeId,
        profilePicture: userToUpdate.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//change profile image
export const changeProfileImage = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user; // Assumes authentication middleware is in place

  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded." });
  }

  // Security Check: Ensure the user is only updating their own profile
  if (requestingUser.id.toString() !== id) {
    return res.status(403).json({
      message: "You are not authorized to change this profile image.",
    });
  }

  try {
    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      // This case should ideally not be reached if the ID from the token is valid
      return res.status(404).json({ message: "User not found." });
    }

    // Optional: Delete the old profile picture to save storage space
    if (
      userToUpdate.profilePicture &&
      userToUpdate.profilePicture.startsWith("/uploads/")
    ) {
      const oldImagePath = `./public${userToUpdate.profilePicture}`;
      // Check if the file exists before trying to delete it
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Failed to delete old profile image:", err);
        });
      }
    }

    userToUpdate.profilePicture = `/uploads/${req.file.filename}`;

    await userToUpdate.save();

    res.status(200).json({
      message: "Profile image updated successfully!",
      user: {
        id: userToUpdate._id,
        names: userToUpdate.names,
        email: userToUpdate.email,
        role: userToUpdate.role,
        profilePicture: userToUpdate.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//change password

export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  const requestingUser = req.user; // Assumes you have authentication middleware

  // 1. Basic Validation
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password are required." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long." });
  }

  // 2. Authorization Check: A user can only change their own password
  if (requestingUser.id.toString() !== id) {
    return res.status(403).json({
      message: "You are not authorized to change this user's password.",
    });
  }

  try {
    // 3. Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    // 5. Hash the new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
