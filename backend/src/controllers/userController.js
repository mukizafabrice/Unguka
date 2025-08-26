import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

export const registerUser = async (req, res) => {
  const { names, email, phoneNumber, nationalId, role, cooperativeId } =
    req.body;
  const defaultPass = "123";
  const requestingUser = req.user;

  // 1. Basic input validation for required fields
  if (!names || !email || !phoneNumber || !nationalId) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const cleanPhone = phoneNumber;
    const cleanNationalId = String(nationalId).trim();

    // 2. Check for existing user with same email, phone, or national ID
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { phoneNumber: cleanPhone },
        { nationalId: cleanNationalId },
      ],
    });

    if (cleanNationalId < 16 && cleanNationalId > 16) {
      return res
        .status(400)
        .json({ message: "Your national Id must be 16 in length" });
    }

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email, phone number, or national ID already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(defaultPass, 10);

    let newUserRole = "member"; // Default for the new user (can be overridden by superadmin)
    let newUserCooperativeId = null; // Default, can be assigned

    // 3. Authorization and Role/CooperativeId Assignment Logic
    if (!requestingUser) {
      // This should ideally be handled by an `auth` middleware before this function
      return res
        .status(401)
        .json({ message: "Authentication required to register users." });
    }

    if (requestingUser.role === "superadmin") {
      newUserRole = role || "member";
      newUserCooperativeId = cooperativeId;
      if (
        newUserRole === "superadmin" &&
        requestingUser.id.toString() !== newUser._id.toString()
      ) {
        // This check is typically for update/delete. For creation, consider if only one superadmin is allowed or if they can create others.
        // For now, allow superadmin to create other superadmins if the 'role' is passed.
      }
    } else if (requestingUser.role === "manager") {
      // Managers can ONLY create 'member's within THEIR OWN cooperative.
      newUserRole = "member"; // Force role to 'member' for manager-initiated registrations
      newUserCooperativeId = requestingUser.cooperativeId; // Assign manager's cooperativeId

      // If manager tries to pass a 'role' or 'cooperativeId' in the body, ignore or reject
      if (role && role !== "member") {
        return res
          .status(403)
          .json({ message: "Managers can only create 'member' accounts." });
      }
      if (
        cooperativeId &&
        cooperativeId.toString() !== requestingUser.cooperativeId.toString()
      ) {
        return res.status(403).json({
          message:
            "Managers can only create users within their own cooperative.",
        });
      }
    } else {
      // Other roles (e.g., 'member') are not allowed to register new users
      return res.status(403).json({
        message: "Access denied: Your role does not permit user creation.",
      });
    }

    // 4. Create new user instance
    const newUser = new User({
      names,
      email,
      password: hashedPassword,
      phoneNumber: cleanPhone,
      nationalId: cleanNationalId,
      role: newUserRole, // Use the determined role
      cooperativeId: newUserCooperativeId, // Use the determined cooperativeId
    });

    // 5. Final validation check for cooperativeId before saving
    // This catches cases where superadmin explicitly tried to create a member/manager without a cooperativeId
    if (
      (newUser.role === "member" || newUser.role === "manager") &&
      !newUser.cooperativeId
    ) {
      return res.status(400).json({
        message: "Cooperative ID is required for members and managers.",
      });
    }

    await newUser.save();

    // ... (rest of your success response, JWT token generation, etc.)
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
    // You might want to distinguish Mongoose validation errors from other errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
// export const registerUser = async (req, res) => {
//   const { names, email, phoneNumber, nationalId, role, cooperativeId } =
//     req.body;
//   const defaultPass = "123";

//   if (!names || !email || !phoneNumber || !nationalId) {
//     return res.status(400).json({ message: "Please fill all required fields" });
//   }

//   try {
//     const cleanPhone = phoneNumber;
//     const cleanNationalId = String(nationalId).trim();

//     const existingUser = await User.findOne({
//       $or: [
//         { email: email },
//         { phoneNumber: cleanPhone },
//         { nationalId: cleanNationalId },
//       ],
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         message:
//           "User with this email, phone number, or national ID already exists.",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(defaultPass, 10);

//     // Set cooperativeId conditionally based on the role
//     const newUser = new User({
//       names,
//       email,
//       password: hashedPassword,
//       phoneNumber: cleanPhone,
//       nationalId: cleanNationalId,
//       role: role || "member",
//       cooperativeId:
//         role === "member" || role === "manager" ? cooperativeId : null,
//     });

//     // Validate that a cooperativeId is provided for non-superadmin roles
//     if (
//       (newUser.role === "member" || newUser.role === "manager") &&!newUser.cooperativeId
//
//     ) {
//       return res.status(400).json({
//         message: "Cooperative ID is required for members and managers.",
//       });
//     }

//     await newUser.save();

//     const token = jwt.sign(
//       {
//         id: newUser._id,
//         role: newUser.role,
//         cooperativeId: newUser.cooperativeId,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: newUser._id,
//         names: newUser.names,
//         email: newUser.email,
//         phoneNumber: newUser.phoneNumber,
//         nationalId: newUser.nationalId,
//         role: newUser.role,
//         cooperativeId: newUser.cooperativeId,
//         profilePicture: newUser.profilePicture,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

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
      {
        id: user._id,
        names: user.names,
        email: user.email,
        nationalId: user.nationalId,
        phoneNumber: user.phoneNumber,
        role: user.role,
        cooperativeId: user.cooperativeId,
        profilePicture: user.profilePicture,
      },
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

export const getAllUsers = async (req, res) => {
  try {
    const requestingUser = req.user;

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
        (role && role !== userToUpdate.role) ||
        (cooperativeId &&
          cooperativeId.toString() !== userToUpdate.cooperativeId.toString())
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

// Update user by ID (PATCH)
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params; // userId from route
    const updates = req.body; // fields to update

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//change profile image

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const changeProfileImage = async (req, res) => {
  const { id } = req.params;

  if (!id || !req.file) {
    return res
      .status(400)
      .json({ message: "User ID or image file is missing." });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      // Delete newly uploaded file if user not found
      await fs.unlink(
        path.join(__dirname, "..", "..", "uploads", req.file.filename)
      );
      return res.status(404).json({ message: "User not found." });
    }

    const oldProfilePicture = user.profilePicture;

    // Use findByIdAndUpdate to update only the profilePicture field
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePicture: `/uploads/${req.file.filename}` },
      { new: true } // Returns the updated user document
    );

    // After a successful database update, delete the old image if it was a local file
    if (oldProfilePicture && oldProfilePicture.startsWith("/uploads/")) {
      const oldImagePath = path.join(__dirname, "..", "..", oldProfilePicture);
      try {
        await fs.unlink(oldImagePath);
        console.log(`Successfully deleted old profile image: ${oldImagePath}`);
      } catch (error) {
        console.error(
          `Failed to delete old image file: ${oldImagePath}`,
          error
        );
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update." });
    }

    res.status(200).json({
      message: "Profile image updated successfully!",
      user: {
        id: updatedUser._id,
        names: updatedUser.names,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    // Delete the new file in case of a database error
    if (req.file) {
      await fs
        .unlink(path.join(__dirname, "..", "..", "uploads", req.file.filename))
        .catch((err) =>
          console.error("Failed to delete new file on rollback:", err)
        );
    }
    res.status(500).json({ message: "Internal server error." });
  }
};

//change password

export const changePassword = async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

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

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//forgot password
import nodemailer from "nodemailer";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always respond with success message to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    // Email message
    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link is valid for 10 minutes:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    `;

    // Nodemailer Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: message,
    });

    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error sending password reset email." });
  }
};

import crypto from "crypto";

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Hash password before saving
    user.password = await bcrypt.hash(password, 12);

    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
};

// fetch user by email
export const getUserByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Fetching user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
