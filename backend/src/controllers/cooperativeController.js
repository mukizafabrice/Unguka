import Cooperative from "../models/Cooperative.js";
import User from "../models/User.js";

// @desc    Create a new cooperative
// @route   POST /api/cooperatives
// @access  Private/Superadmin
export const createCooperative = async (req, res) => {
  const {
    name,
    registrationNumber,
    district,
    sector,
    contactEmail,
    contactPhone,
  } = req.body;
  const requestingUser = req.user;

  if (requestingUser.role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Only superadmins can create cooperatives.",
    });
  }

  if (!name || !registrationNumber || !district || !sector) {
    return res
      .status(400)
      .json({ message: "Please fill all required cooperative fields." });
  }

  try {
    const existingCooperative = await Cooperative.findOne({
      $or: [{ name: name }, { registrationNumber: registrationNumber }],
    });

    if (existingCooperative) {
      return res.status(400).json({
        message:
          "Cooperative with this name or registration number already exists.",
      });
    }

    const newCooperative = new Cooperative({
      name,
      registrationNumber,
      district,
      sector,
      contactEmail,
      contactPhone,
    });

    await newCooperative.save();

    res.status(201).json({
      message: "Cooperative created successfully",
      cooperative: newCooperative,
    });
  } catch (error) {
    console.error("Error creating cooperative:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc    Get all cooperatives
// @route   GET /api/cooperatives
// @access  Private/Superadmin
export const getAllCooperatives = async (req, res) => {
  const requestingUser = req.user;

  // if (requestingUser.role !== "superadmin") {
  //   return res.status(403).json({
  //     message: "Access denied. Only superadmins can view all cooperatives.",
  //   });
  // }

  try {
    const cooperatives = await Cooperative.find();
    res.status(200).json(cooperatives);
  } catch (error) {
    console.error("Error fetching cooperatives:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc    Get cooperative by ID
// @route   GET /api/cooperatives/:id
// @access  Private/Superadmin
export const getCooperativeById = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  // if (requestingUser.role !== "superadmin") {
  //   return res
  //     .status(403)
  //     .json({
  //       message:
  //         "Access denied. Only superadmins can view cooperative details.",
  //     });
  // }

  if (!id) {
    return res.status(400).json({ message: "Cooperative ID is required." });
  }

  try {
    const cooperative = await Cooperative.findById(id);

    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found." });
    }

    res.status(200).json(cooperative);
  } catch (error) {
    console.error("Error fetching cooperative:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc    Update a cooperative
// @route   PUT /api/cooperatives/:id
// @access  Private/Superadmin
export const updateCooperative = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    registrationNumber,
    district,
    sector,
    contactEmail,
    contactPhone,
    isActive,
  } = req.body;
  const requestingUser = req.user;

  if (requestingUser.role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Only superadmins can update cooperatives.",
    });
  }

  if (!id) {
    return res.status(400).json({ message: "Cooperative ID is required." });
  }

  try {
    const cooperativeToUpdate = await Cooperative.findById(id);

    if (!cooperativeToUpdate) {
      return res.status(404).json({ message: "Cooperative not found." });
    }

    cooperativeToUpdate.name = name || cooperativeToUpdate.name;
    cooperativeToUpdate.registrationNumber =
      registrationNumber || cooperativeToUpdate.registrationNumber;
    cooperativeToUpdate.district = district || cooperativeToUpdate.district;
    cooperativeToUpdate.sector = sector || cooperativeToUpdate.sector;
    cooperativeToUpdate.contactEmail =
      contactEmail === undefined
        ? cooperativeToUpdate.contactEmail
        : contactEmail;
    cooperativeToUpdate.contactPhone =
      contactPhone === undefined
        ? cooperativeToUpdate.contactPhone
        : contactPhone;
    cooperativeToUpdate.isActive =
      isActive === undefined ? cooperativeToUpdate.isActive : isActive;

    await cooperativeToUpdate.save();

    res.status(200).json({
      message: "Cooperative updated successfully",
      cooperative: cooperativeToUpdate,
    });
  } catch (error) {
    console.error("Error updating cooperative:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Cooperative name or registration number already exists.",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc    Delete a cooperative
// @route   DELETE /api/cooperatives/:id
// @access  Private/Superadmin
export const deleteCooperative = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  if (requestingUser.role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Only superadmins can delete cooperatives.",
    });
  }

  if (!id) {
    return res.status(400).json({ message: "Cooperative ID is required." });
  }

  try {
    const cooperativeToDelete = await Cooperative.findById(id);

    if (!cooperativeToDelete) {
      return res.status(404).json({ message: "Cooperative not found." });
    }

    // Unassign manager and members before deletion
    await User.updateMany(
      { cooperativeId: id },
      { $unset: { cooperativeId: "" } }
    );

    await Cooperative.findByIdAndDelete(id);

    res.status(200).json({
      message:
        "Cooperative deleted successfully and associated data has been cleaned up.",
    });
  } catch (error) {
    console.error("Error deleting cooperative:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
