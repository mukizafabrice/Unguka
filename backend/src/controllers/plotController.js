import Plot from "../models/Plot.js";
import mongoose from "mongoose";

// Create a new Plot
export const createPlot = async (req, res) => {
  try {
    // ⭐ UPDATED: Expect size instead of area, and cooperativeId
    const { userId, cooperativeId, size, upi } = req.body;

    // Validate ObjectIds for userId and cooperativeId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid userId or cooperativeId" });
    }

    // Validate required fields
    // ⭐ UPDATED: Check for size instead of area
    if (!size || !upi) {
      return res.status(400).json({ message: "Size and UPI are required" });
    }

    // Validate UPI uniqueness (it's globally unique as per schema)
    const existingPlot = await Plot.findOne({ upi: upi.trim() });
    if (existingPlot) {
      return res.status(400).json({ message: "UPI already exists." });
    }

    // Create and save new Plot with cooperativeId and size
    // ⭐ UPDATED: Use size instead of area, and include cooperativeId
    const newPlot = new Plot({ userId, cooperativeId, size, upi: upi.trim() });
    await newPlot.save();

    res
      .status(201)
      .json({ message: "Plot created successfully", data: newPlot });
  } catch (error) {
    console.error("Error creating plot:", error);
    // Handle specific validation errors from Mongoose schema
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Handle duplicate key error for UPI (if it were unique per coop or global)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A plot with this UPI already exists." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Plots with user info populated
export const getAllPlots = async (req, res) => {
  try {
    // ⭐ NEW: Allow filtering by cooperativeId for multi-cooperative access
    const { cooperativeId, userId } = req.query; // Also allow filtering by userId
    let query = {};

    if (cooperativeId) {
      query.cooperativeId = cooperativeId;
    }
    if (userId) {
      query.userId = userId;
    }

    // ⭐ UPDATED: Removed productId population as it's no longer in the model
    const plots = await Plot.find(query)
      .populate("userId", "names phoneNumber") // select fields from user
      .populate("cooperativeId", "name registrationNumber") // Populate cooperative info
      .sort({ createdAt: -1 });

    res.status(200).json({ data: plots });
  } catch (error) {
    console.error("Error fetching plots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPlotById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid plot ID" });
    }

    const plot = await Plot.find({ userId })
      .populate("userId", "names phoneNumber")
      .sort({ createdAt: -1 });

    if (!plot) {
      return res.status(404).json({ message: "Plot not found" });
    }

    res.status(200).json({ data: plot });
  } catch (error) {
    console.error("Error fetching plot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Plot by ID
export const updatePlot = async (req, res) => {
  try {
    const { id } = req.params;
    // ⭐ UPDATED: Expect cooperativeId and size, productId is removed
    const { userId, cooperativeId, size, upi } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plot ID" });
    }

    // Ensure cooperativeId is provided for update authorization
    if (!cooperativeId) {
      return res
        .status(400)
        .json({ message: "Cooperative ID is required for updating plot." });
    }
    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ message: "Invalid cooperativeId" });
    }

    // Validate optional fields (if provided) and construct update data
    const updateData = {};
    if (userId !== undefined) {
      // Check if userId is provided to update
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      updateData.userId = userId;
    }
    // ⭐ UPDATED: Check for size instead of area
    if (size !== undefined) {
      if (size < 0.01) {
        return res.status(400).json({ message: "Size must be at least 0.01" });
      }
      updateData.size = size;
    }
    if (upi !== undefined) {
      if (typeof upi !== "string" || upi.length < 5 || upi.length > 20) {
        return res.status(400).json({
          message: "UPI must be a string between 5 and 20 characters",
        });
      }
      updateData.upi = upi.trim();
    }

    // EnsureUPI uniqueness if it's being updated (exclude current plot)
    if (updateData.upi) {
      const existingPlotWithSameUpi = await Plot.findOne({
        upi: updateData.upi,
        _id: { $ne: id }, // Exclude the current plot from the check
      });
      if (existingPlotWithSameUpi) {
        return res
          .status(400)
          .json({ message: "UPI already exists for another plot." });
      }
    }

    // Find and update the plot, ensuring it belongs to the correct cooperative
    const updatedPlot = await Plot.findOneAndUpdate(
      { _id: id, cooperativeId: cooperativeId }, // Query by ID and cooperativeId for secure update
      updateData,
      { new: true, runValidators: true } // runValidators ensures schema validations are applied on update
    )
      .populate("userId", "names phoneNumber")
      .populate("cooperativeId", "name registrationNumber"); // Populate cooperative info

    if (!updatedPlot) {
      return res
        .status(404)
        .json({ message: "Plot not found or unauthorized to update" });
    }

    res
      .status(200)
      .json({ message: "Plot updated successfully", data: updatedPlot });
  } catch (error) {
    console.error("Error updating plot:", error);
    // Handle invalid ID format or validation errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "UPI already exists." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Plot by ID
export const deletePlot = async (req, res) => {
  try {
    const { id } = req.params;
    // ⭐ NEW: Expect cooperativeId in body for authorization on delete
    const { cooperativeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plot ID" });
    }

    // Ensure cooperativeId is provided for delete authorization
    if (!cooperativeId) {
      return res
        .status(400)
        .json({ message: "Cooperative ID is required for deleting plot." });
    }
    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res.status(400).json({ message: "Invalid cooperativeId" });
    }

    // Find and delete the plot, ensuring it belongs to the correct cooperative
    const deletedPlot = await Plot.findOneAndDelete({
      _id: id,
      cooperativeId: cooperativeId,
    });

    if (!deletedPlot) {
      return res
        .status(404)
        .json({ message: "Plot not found or unauthorized to delete" });
    }

    res.status(200).json({ message: "Plot deleted successfully" });
  } catch (error) {
    console.error("Error deleting plot:", error);
    // Handle invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid plot ID format." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
