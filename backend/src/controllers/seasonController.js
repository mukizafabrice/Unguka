import Season from "../models/Season.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js"; // Assuming FeeType model also has cooperativeId

// Create a new season
export const createSeason = async (req, res) => {
  // ⭐ UPDATED: Extract cooperativeId from req.body
  const { name, year, cooperativeId } = req.body;

  // Validate required fields including cooperativeId
  if (!name || !year || !cooperativeId) {
    return res.status(400).json({
      success: false,
      message: "Name, year, and cooperative ID are required",
    });
  }

  // Validate cooperativeId format
  if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid cooperative ID format" });
  }

  try {
    const existingSeason = await Season.findOne({ name, year, cooperativeId });
    if (existingSeason) {
      return res.status(409).json({
        success: false,
        message: `Season '${name}' for year ${year} already exists in this cooperative`,
      });
    }

    // ⭐ UPDATED: Include cooperativeId when creating a new Season
    const season = new Season({ name, year, cooperativeId });
    await season.save();

    res.status(201).json({
      success: true,
      message: "Season created successfully",
      data: season,
    });
  } catch (error) {
    console.error("Error creating season:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Handle duplicate key error specifically for the unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Season '${name}' for year ${year} already exists in this cooperative.`,
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all seasons
export const getAllSeasons = async (req, res) => {
  try {
    const { cooperativeId } = req.query;
    let query = {};

    if (cooperativeId) {
      if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cooperative ID" });
      }
      query.cooperativeId = cooperativeId;
    }

    const seasons = await Season.find(query)
      .populate("cooperativeId", "name registrationNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: seasons,
      message: "Seasons fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching seasons:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get a single season by ID
export const getSeasonById = async (req, res) => {
  try {
    const { id } = req.params;
    // ⭐ NEW: Expect cooperativeId in query for authorization
    const { cooperativeId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid season ID" });
    }
    if (cooperativeId && !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cooperative ID" });
    }

    // ⭐ UPDATED: Find season by ID and cooperativeId for security
    let query = { _id: id };
    if (cooperativeId) {
      query.cooperativeId = cooperativeId;
    }

    const season = await Season.findOne(query).populate(
      "cooperativeId",
      "name registrationNumber"
    );

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found or unauthorized access",
      });
    }
    res.status(200).json({
      success: true,
      data: season,
      message: "Season fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching season:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid season ID format." });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update a season
export const updateSeason = async (req, res) => {
  const { id } = req.params;
  // ⭐ UPDATED: Expect cooperativeId in body for authorization
  const { name, year, status, cooperativeId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid season ID" });
  }
  // Validate cooperativeId from body
  if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
    return res.status(400).json({
      success: false,
      message: "Cooperative ID is required and must be valid.",
    });
  }

  try {
    // ⭐ UPDATED: Find season by ID and cooperativeId for secure update
    const season = await Season.findOne({
      _id: id,
      cooperativeId: cooperativeId,
    });
    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found or unauthorized to update",
      });
    }

    const oldStatus = season.status;
    season.name = name !== undefined ? name : season.name;
    season.year = year !== undefined ? year : season.year;
    season.status = status !== undefined ? status : season.status;
    await season.save({ runValidators: true });

    // Logic to be executed only when a season is activated for the first time
    if (season.status === "active" && oldStatus !== "active") {
      // ⭐ UPDATED: Filter members by cooperativeId
      const members = await User.find({
        role: "member",
        cooperativeId: season.cooperativeId,
      });
      console.log(
        `Found ${members.length} members for cooperative ${season.cooperativeId}.`
      );

      // ⭐ UPDATED: Filter fee types by cooperativeId
      const feeTypes = await FeeType.find({
        isPerSeason: true,
        status: "active",
        cooperativeId: season.cooperativeId, // Ensure fee type belongs to the same cooperative
      });
      console.log(
        `Found ${feeTypes.length} per-season fee types for cooperative ${season.cooperativeId}.`
      );

      const feesToInsert = [];

      if (members.length > 0 && feeTypes.length > 0) {
        for (const member of members) {
          for (const feeType of feeTypes) {
            if (feeType.autoApplyOnCreate) {
              feesToInsert.push({
                userId: member._id,
                seasonId: season._id,
                feeTypeId: feeType._id,
                amountOwed: feeType.amount,
                status: "unpaid",
              });
            }
          }
        }

        if (feesToInsert.length > 0) {
          await Fees.insertMany(feesToInsert, { ordered: false });
          console.log(
            `Successfully inserted ${feesToInsert.length} new fee documents for cooperative ${season.cooperativeId}.`
          );
        } else {
          console.log(
            "No fees to insert because no fee types were set to auto-apply or no matching members/fee types were found."
          );
        }
      } else {
        console.log(
          "No fees inserted because either no members or no matching fee types were found for this cooperative."
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Season updated successfully",
      data: season,
    });
  } catch (error) {
    console.error("Error updating season:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Handle duplicate key error specifically for the unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Season '${name}' for year ${year} already exists in this cooperative.`,
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a season
export const deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;
    // ⭐ NEW: Expect cooperativeId in body for authorization
    const { cooperativeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid season ID" });
    }
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({
        success: false,
        message: "Cooperative ID is required and must be valid.",
      });
    }

    // ⭐ UPDATED: Find and delete season by ID and cooperativeId for security
    const season = await Season.findOneAndDelete({
      _id: id,
      cooperativeId: cooperativeId,
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found or unauthorized to delete",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Season deleted successfully" });
  } catch (error) {
    console.error("Error deleting season:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
