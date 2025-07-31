import FeeType from "../models/FeeType.js";

// Create new fee type
export const createFeeType = async (req, res) => {
  try {
    const { name, amount, description, status } = req.body;

    if (!name || amount == null) {
      return res.status(400).json({ message: "Name and amount are required" });
    }

    // Check for existing fee type with same name
    const existing = await FeeType.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Fee type already exists" });
    }

    const feeType = new FeeType({
      name: name.trim(),
      amount,
      description,
      status,
    });

    await feeType.save();
    res.status(201).json({ message: "Fee type created", feeType });
  } catch (error) {
    console.error("Error creating fee type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all fee types (optionally filter by status)
export const getFeeTypes = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const feeTypes = await FeeType.find(filter).sort({ createdAt: -1 });
    res.status(200).json(feeTypes);
  } catch (error) {
    console.error("Error fetching fee types:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get fee type by ID
export const getFeeTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const feeType = await FeeType.findById(id);
    if (!feeType) {
      return res.status(404).json({ message: "Fee type not found" });
    }
    res.status(200).json(feeType);
  } catch (error) {
    console.error("Error fetching fee type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update fee type by ID
export const updateFeeType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, description, status } = req.body;

    if (!name || amount == null) {
      return res.status(400).json({ message: "Name and amount are required" });
    }

    const feeType = await FeeType.findById(id);
    if (!feeType) {
      return res.status(404).json({ message: "Fee type not found" });
    }

    // Check if new name conflicts with another fee type
    if (name.trim() !== feeType.name) {
      const exists = await FeeType.findOne({ name: name.trim() });
      if (exists) {
        return res
          .status(409)
          .json({ message: "Fee type name already in use" });
      }
    }

    feeType.name = name.trim();
    feeType.amount = amount;
    feeType.description = description ?? feeType.description;
    feeType.status = status ?? feeType.status;

    await feeType.save();

    res.status(200).json({ message: "Fee type updated", feeType });
  } catch (error) {
    console.error("Error updating fee type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete fee type by ID
export const deleteFeeType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FeeType.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Fee type not found" });
    }
    res.status(200).json({ message: "Fee type deleted" });
  } catch (error) {
    console.error("Error deleting fee type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
