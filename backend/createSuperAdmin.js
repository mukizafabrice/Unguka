// createSuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import connectDB from "./db.js"; // <-- Your shared database connection function

dotenv.config();

async function createSuperAdmin() {
  try {
    // Connect to MongoDB using the shared function
    await connectDB();
    console.log("MongoDB Connected for Superadmin Creation ✅");

    // Hardcoded Super Admin details
    const superAdminData = {
      names: "System Admin",
      email: "superadmin@example.com",
      password: "superadmin", 
      phoneNumber: "+250781111111", 
      nationalId: 1234567890123456,
      role: "superadmin",
      profilePicture: "https://www.w3schools.com/howto/img_avatar.png",
      cooperativeId: null,
    };

    // Check if super admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: superAdminData.email },
        { phoneNumber: superAdminData.phoneNumber },
        { nationalId: superAdminData.nationalId },
      ],
    });

    if (existingAdmin) {
      console.log("Super admin already exists with provided email, phone number, or national ID. Skipping creation. ℹ️");
      console.log("Existing Superadmin Details:", {
        email: existingAdmin.email,
        names: existingAdmin.names,
        role: existingAdmin.role,
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
    superAdminData.password = hashedPassword;
    console.log("Password hashed successfully.");

    // Create super admin
    const newAdmin = new User(superAdminData);
    await newAdmin.save();

    console.log("✅ Super admin created successfully!");
    console.log("Details:", {
      id: newAdmin._id,
      email: newAdmin.email,
      names: newAdmin.names,
      phoneNumber: newAdmin.phoneNumber,
      nationalId: newAdmin.nationalId,
      role: newAdmin.role,
    });

  } catch (error) {
    console.error("❌ Error creating super admin:", error.message);
    if (error.code === 11000) {
      console.error("Duplicate key error: A user with this email, phone number, or national ID might already exist.");
    }
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
      console.log("MongoDB Connection Closed.");
    }
  }
}

createSuperAdmin();