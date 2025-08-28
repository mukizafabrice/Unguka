import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";
import Cash from "../models/Cash.js";
// feesController.js

// Centralized error handler
const handleServerError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ message: "Internal server error" });
};

export const recordPayment = async (req, res) => {
  try {
    const { userId, seasonId, feeTypeId } = req.body;
    const { cooperativeId } = req.user;

    if (!userId || !seasonId || !feeTypeId) {
      return res.status(400).json({ message: "Invalid or missing fields." });
    }

    // Find the fee type
    const feeType = await FeeType.findById(feeTypeId);
    if (!feeType) {
      return res.status(404).json({ message: "FeeType not found" });
    }

    // Create new fee record
    const feeRecord = new Fees({
      cooperativeId,
      userId,
      seasonId,
      feeTypeId,
      amountOwed: feeType.amount,
      amountPaid: 0,
      status: "unpaid",
    });

    await feeRecord.save();

    // If you want to track cooperative cash balance, update it here:
    // Example: let’s assume you have a `Cash` model
    // const updatedCash = await Cash.findOneAndUpdate(
    //   { cooperativeId },
    //   { $inc: { balance: feeType.amount } },  // or adjust logic
    //   { new: true, upsert: true }
    // );

    res.status(200).json({
      message: "Fee recorded successfully.",
      feeRecord,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({
      message: error.message || "Server error", // Send MongoDB error to frontend
    });
  }
};

export const getFeesByUserAndSeason = async (req, res) => {
  try {
    const { userId, seasonId } = req.params; // 🔑 Simplified: Directly use the cooperativeId from the token.
    const { cooperativeId } = req.user;

    const fees = await Fees.find({ cooperativeId, userId, seasonId }).populate(
      "feeTypeId",
      "name amount description"
    );

    if (!fees || fees.length === 0) {
      return res.status(404).json({
        message:
          "No fees found for this user in the specified season and cooperative.",
      });
    }

    res.status(200).json(fees);
  } catch (error) {
    handleServerError(res, error, "Error fetching fees by user and season:");
  }
};

export const getAllFees = async (req, res) => {
  try {
    const { cooperativeId, role } = req.user;

    let query = {};
    if (role === "manager") {
      query.cooperativeId = cooperativeId;
    } else if (role === "superadmin" && req.params.cooperativeId) {
      query.cooperativeId = req.params.cooperativeId;
    }

    if (Object.keys(query).length === 0 && role === "superadmin") {
      query = {};
    } else if (Object.keys(query).length === 0) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not authorized to view this data." });
    }

    const fees = await Fees.find(query)
      .populate("userId", "names")
      .populate("seasonId", "name year")
      .populate("feeTypeId", "name amount")
      .sort({ createdAt: -1 })
      .exec();

    res
      .status(200)
      .json({ success: true, message: "Fees fetched.", data: fees });
  } catch (error) {
    handleServerError(res, error, "Error fetching all fees for cooperative:");
  }
};

export const getAllFeesById = async (req, res) => {
  const { userId } = req.params;
  try {
    const fees = await Fees.find({ userId })
      .populate("userId", "names")
      .populate("seasonId", "name year")
      .populate("feeTypeId", "name amount")
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(fees);
  } catch (error) {
    console.error("Error fetching fees by user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    const { cooperativeId } = req.user;
    const updates = req.body;

    const disallowedFields = [
      "userId",
      "seasonId",
      "feeTypeId",
      "cooperativeId",
      "createdAt",
      "updatedAt",
      "__v",
    ];
    disallowedFields.forEach((field) => delete updates[field]);

    const updatedFee = await Fees.findOneAndUpdate(
      { _id: feeId, cooperativeId }, // Find by both ID and the secure cooperativeId
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedFee) {
      return res.status(404).json({
        message: "Fee not found or does not belong to your cooperative.",
      });
    }

    res
      .status(200)
      .json({ message: "Fee updated successfully.", fee: updatedFee });
  } catch (error) {
    handleServerError(res, error, "Error updating fee:");
  }
};

// ----------------------------------------------------
// ✅ REVISED: deleteFee
// ----------------------------------------------------
export const deleteFee = async (req, res) => {
  try {
    const feeId = req.params.id; // 🔑 Correctly uses cooperativeId from the token for the query
    const { cooperativeId } = req.user;

    const deletedFee = await Fees.findOneAndDelete({
      _id: feeId,
      cooperativeId,
    });

    if (!deletedFee) {
      return res.status(404).json({
        message: "Fee not found or does not belong to your cooperative.",
      });
    }

    res
      .status(200)
      .json({ message: "Fee deleted successfully.", fee: deletedFee });
  } catch (error) {
    handleServerError(res, error, "Error deleting fee:");
  }
};

export const payFee = async (req, res) => {
  const { feeId } = req.params;
  const { paymentAmount } = req.body;
  const { cooperativeId } = req.user;

  try {
    if (paymentAmount == null || paymentAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must be a positive number." });
    }
    console.log("DEBUG payFee:", { feeId, cooperativeId, body: req.body });
    const feeRecord = await Fees.findOne({ _id: feeId, cooperativeId });
    if (!feeRecord) {
      return res
        .status(404)
        .json({ message: "Fee record not found in your cooperative." });
    }

    const newAmountPaid = feeRecord.amountPaid + paymentAmount;

    if (newAmountPaid > feeRecord.amountOwed) {
      return res.status(400).json({ message: "Payment exceeds amount owed." });
    }

    const newremainingToPay = feeRecord.amountOwed - newAmountPaid;
    feeRecord.amountPaid = newAmountPaid;
    feeRecord.remainingToPay = newremainingToPay;

    if (newremainingToPay === 0) {
      feeRecord.status = "paid";
    } else {
      feeRecord.status = "partial";
    }

    await feeRecord.save();

    const updatedCash = await Cash.findOneAndUpdate(
      { cooperativeId },
      { $inc: { amount: paymentAmount } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Payment recorded successfully.",
      feeRecord,
      cash: updatedCash,
    });
  } catch (error) {
    console.error("Error processing fee payment:", error);
    res.status(500).json({ message: "Server error." });
  }
};
