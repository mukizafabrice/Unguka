import Loan from "../models/Loan.js";

// Create a new loan
export const createLoan = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, totalPrice, status } =
      req.body;

    if (!userId || !productId || !seasonId || !quantity || !totalPrice) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const newLoan = new Loan({
      userId,
      productId,
      seasonId,
      quantity,
      totalPrice,
      status: status || "pending",
    });

    await newLoan.save();
    res
      .status(201)
      .json({ message: "Loan created successfully", loan: newLoan });
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all loans with populated user, product, and season info
export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("userId", "names phoneNumber role")
      .populate("productId", "productName")
      .populate("seasonId", "seasonName startDate endDate")
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single loan by ID
export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("userId", "names phoneNumber role")
      .populate("productId", "productName")
      .populate("seasonId", "seasonName startDate endDate");

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("Error fetching loan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a loan by ID
export const updateLoan = async (req, res) => {
  try {
    const { userId, productId, seasonId, quantity, totalPrice, status } =
      req.body;

    const updatedLoan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        userId,
        productId,
        seasonId,
        quantity,
        totalPrice,
        status,
      },
      { new: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res
      .status(200)
      .json({ message: "Loan updated successfully", loan: updatedLoan });
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a loan by ID
export const deleteLoan = async (req, res) => {
  try {
    const deletedLoan = await Loan.findByIdAndDelete(req.params.id);

    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
