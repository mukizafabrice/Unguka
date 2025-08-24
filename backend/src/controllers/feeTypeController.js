import FeeType from "../models/FeeType.js";
import { assignFeeToAllUsers } from "../services/feesService.js"; // This service needs to be updated to accept cooperativeId
import Season from "../models/Season.js";
import User from "../models/User.js";
import Fees from "../models/Fees.js"; // Import Fees model for insertMany operation
import mongoose from "mongoose"; // Import mongoose for ObjectId validation

// Create new fee type
export const createFeeType = async (req, res) => {
  try {
    const {
      name,
      amount,
      description,
      status,
      isPerSeason,
      autoApplyOnCreate,
      cooperativeId,
    } = req.body;

    // Basic validation for required fields
    if (!name || amount == null || !cooperativeId) {
      return res.status(400).json({
        success: false,
        message: "Name, amount, and Cooperative ID are required.",
      });
    }

    // Validate cooperativeId format
    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Cooperative ID format." });
    }

    // ⭐ UPDATED: Check for existing fee type with same name *within the specific cooperative*
    const existingFeeType = await FeeType.findOne({
      name: name.trim(),
      cooperativeId,
    });
    if (existingFeeType) {
      return res.status(409).json({
        success: false,
        message:
          "A fee type with this name already exists in this cooperative.",
      });
    }

    // ⭐ UPDATED: Create new FeeType including cooperativeId
    const feeType = new FeeType({
      name: name.trim(),
      amount,
      description,
      status,
      isPerSeason,
      autoApplyOnCreate,
      cooperativeId, // Assign cooperativeId
    });

    await feeType.save();

    // Auto-assign logic, now considering cooperativeId
    if (feeType.autoApplyOnCreate) {
      if (feeType.isPerSeason) {
        // ⭐ UPDATED: Find active season specific to the cooperative
        const activeSeason = await Season.findOne({
          status: "active",
          cooperativeId,
        });

        if (!activeSeason) {
          console.warn(
            `No active season found for cooperative ${cooperativeId}. Cannot auto-assign per-season fees.`
          );
          // Still return success for fee type creation, but inform about auto-assignment issue
          return res.status(201).json({
            success: true,
            message:
              "Fee type created successfully, but no active season found for auto-assignment.",
            data: feeType,
          });
        }
        await assignFeeToAllUsers(feeType._id, activeSeason._id, cooperativeId);
      } else {
        // Non-seasonal → assign with null seasonId, but still pass cooperativeId
        await assignFeeToAllUsers(feeType._id, null, cooperativeId);
      }
    }

    res.status(201).json({
      success: true,
      message: "Fee type created successfully",
      data: feeType,
    });
  } catch (error) {
    console.error("Error creating fee type:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Handle duplicate key error (code 11000) for the compound unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A fee type with this name already exists in this cooperative.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all fee types (optionally filter by status and cooperativeId)
export const getFeeTypes = async (req, res) => {
  try {
    const { status, cooperativeId } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (cooperativeId) {
      if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Cooperative ID format." });
      }
      filter.cooperativeId = cooperativeId;
    }

    const feeTypes = await FeeType.find(filter)
      .populate("cooperativeId", "name registrationNumber") // Populate cooperative details
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feeTypes,
      message: "Fee types fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching fee types:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get fee type by ID (scoped by cooperativeId)
export const getFeeTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { cooperativeId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Fee Type ID format." });
    }
    if (cooperativeId && !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Cooperative ID format." });
    }

    let query = { _id: id };
    if (cooperativeId) {
      query.cooperativeId = cooperativeId;
    }

    const feeType = await FeeType.findOne(query).populate(
      "cooperativeId",
      "name registrationNumber"
    );

    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: "Fee type not found or unauthorized access.",
      });
    }
    res.status(200).json({
      success: true,
      data: feeType,
      message: "Fee type retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching fee type:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Fee Type ID format." });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update fee type by ID (scoped by cooperativeId)
export const updateFeeType = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      description,
      status,
      isPerSeason,
      autoApplyOnCreate,
      cooperativeId,
    } = req.body;

    // Validate ID and required fields including cooperativeId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Fee Type ID format." });
    }
    if (!name || amount == null || !cooperativeId) {
      return res.status(400).json({
        success: false,
        message: "Name, amount, and Cooperative ID are required for update.",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Cooperative ID format." });
    }

    const feeType = await FeeType.findOne({ _id: id, cooperativeId });
    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: "Fee type not found or unauthorized to update.",
      });
    }

    if (name.trim().toLowerCase() !== feeType.name.toLowerCase()) {
      const exists = await FeeType.findOne({
        name: name.trim(),
        cooperativeId,
      });
      if (exists) {
        return res.status(409).json({
          success: false,
          message:
            "A fee type with this name already exists in this cooperative.",
        });
      }
    }

    // Update fields
    feeType.name = name.trim();
    feeType.amount = amount;
    // Use optional chaining or nullish coalescing for optional fields
    feeType.description =
      description !== undefined ? description : feeType.description;
    feeType.status = status !== undefined ? status : feeType.status;
    feeType.isPerSeason =
      isPerSeason !== undefined ? isPerSeason : feeType.isPerSeason;
    feeType.autoApplyOnCreate =
      autoApplyOnCreate !== undefined
        ? autoApplyOnCreate
        : feeType.autoApplyOnCreate;

    await feeType.save();

    res.status(200).json({
      success: true,
      message: "Fee type updated successfully",
      data: feeType,
    });
  } catch (error) {
    console.error("Error updating fee type:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Handle duplicate key error (code 11000) for the compound unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A fee type with this name already exists in this cooperative.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete fee type by ID (scoped by cooperativeId)
export const deleteFeeType = async (req, res) => {
  try {
    const { id } = req.params;
    const { cooperativeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Fee Type ID format." });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Cooperative ID is required and must be valid.",
      });
    }
    
    const deleted = await FeeType.findOneAndDelete({ _id: id, cooperativeId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Fee type not found or unauthorized to delete.",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Fee type deleted successfully" });
  } catch (error) {
    console.error("Error deleting fee type:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
