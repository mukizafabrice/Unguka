import Plot from "../models/Plot.js";
import mongoose from "mongoose";

// Create a new Plot
export const createPlot = async (req, res) => {
  try {
    const { userId, productId, area, upi } = req.body;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    // Validate required fields
    if (!area || !upi) {
      return res.status(400).json({ message: "Area and UPI are required" });
    }

    // Create and save new Plot
    const newPlot = new Plot({ userId, productId, area, upi });
    await newPlot.save();

    res
      .status(201)
      .json({ message: "Plot created successfully", data: newPlot });
  } catch (error) {
    console.error("Error creating plot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Plots with user and product info populated
export const getAllPlots = async (req, res) => {
  try {
    const plots = await Plot.find()
      .populate("userId", "names phoneNumber") // select fields from user
      .populate("productId", "productName unitPrice"); // select fields from product

    res.status(200).json({ data: plots });
  } catch (error) {
    console.error("Error fetching plots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get one Plot by ID with populated fields
export const getPlotById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plot ID" });
    }

    const plot = await Plot.findById(id)
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName unitPrice");

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
    const { userId, productId, area, upi } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plot ID" });
    }

    // Validate optional fields (if provided)
    const updateData = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      updateData.userId = userId;
    }
    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }
      updateData.productId = productId;
    }
    if (area !== undefined) {
      if (area < 0.01) {
        return res.status(400).json({ message: "Area must be at least 0.01" });
      }
      updateData.area = area;
    }
    if (upi !== undefined) {
      if (typeof upi !== "string" || upi.length < 5 || upi.length > 20) {
        return res.status(400).json({
          message: "UPI must be a string between 5 and 20 characters",
        });
      }
      updateData.upi = upi.trim();
    }

    const updatedPlot = await Plot.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("userId", "names phoneNumber")
      .populate("productId", "productName unitPrice");

    if (!updatedPlot) {
      return res.status(404).json({ message: "Plot not found" });
    }

    res
      .status(200)
      .json({ message: "Plot updated successfully", data: updatedPlot });
  } catch (error) {
    console.error("Error updating plot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Plot by ID
export const deletePlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plot ID" });
    }

    const deletedPlot = await Plot.findByIdAndDelete(id);

    if (!deletedPlot) {
      return res.status(404).json({ message: "Plot not found" });
    }

    res.status(200).json({ message: "Plot deleted successfully" });
  } catch (error) {
    console.error("Error deleting plot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
