import Fees from "../models/Fees.js";
import User from "../models/User.js";

// CREATE FEE
export const createFee = async (req, res) => {
  try {
    const { userId, seasonId, amount } = req.body;

    const newFee = new Fees({ userId, seasonId, amount });
    await newFee.save();

    res.status(201).json({ message: "Fee created successfully", data: newFee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating fee", error: error.message });
  }
};

// GET ALL FEES
export const getAllFees = async (req, res) => {
  try {
    const fees = await Fees.find()
      .populate("userId", "names phoneNumber")
      .populate("seasonId", "name");

    res.status(200).json(fees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching fees", error: error.message });
  }
};

// GET FEE BY ID
export const getFeeById = async (req, res) => {
  try {
    const fee = await Fees.findById(req.params.id)
      .populate("userId", "names phoneNumber")
      .populate("seasonId", "name");

    if (!fee) return res.status(404).json({ message: "Fee not found" });

    res.status(200).json(fee);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching fee", error: error.message });
  }
};

// GET FEES BY PHONE NUMBER
export const getFeesByPhoneNumber = async (req, res) => {
  try {
    const user = await User.findOne({ phoneNumber: req.params.phoneNumber });

    if (!user) return res.status(404).json({ message: "User not found" });

    const fees = await Fees.find({ userId: user._id })
      .populate("userId", "names phoneNumber")
      .populate("seasonId", "name");

    res.status(200).json(fees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching fees", error: error.message });
  }
};

// UPDATE FEE
// update a fee by ID
export const updateFee = async (req, res) => {
  try {
    const updatedFee = await Fees.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedFee) return res.status(404).json({ message: "Fee not found" });

    res
      .status(200)
      .json({ message: "Fee updated successfully", data: updatedFee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating fee", error: error.message });
  }
};

// MARK FEE AS PAID
// This function marks a fee as paid and updates the stock accordingly

export const markFeeAsPaid = async (req, res) => {
  try {
    const feeId = req.params.id;

    const fee = await Fees.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    if (fee.status === "paid") {
      return res.status(400).json({ message: "Fee is already marked as paid" });
    }

    // Update status
    fee.status = "paid";
    await fee.save();

    // Update stock
    const stock = await Stock.findOne(); // assuming one stock document
    if (stock) {
      stock.cash += fee.amount;
      await stock.save();
    }

    res
      .status(200)
      .json({ message: "Fee marked as paid and stock updated", data: fee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating fee", error: error.message });
  }
};

// DELETE FEE
// delete a fee and adjust stock if it was paid

export const deleteFee = async (req, res) => {
  try {
    const feeId = req.params.id;

    const fee = await Fees.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    // If it's paid, subtract from stock
    if (fee.status === "paid") {
      const stock = await Stock.findOne();
      if (stock) {
        stock.cash -= fee.amount;
        await stock.save();
      }
    }

    // Delete the fee
    await Fees.findByIdAndDelete(feeId);

    res.status(200).json({ message: "Fee deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete fee", error: error.message });
  }
};
