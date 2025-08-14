import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";
import Cash from "../models/Cash.js"; // Assuming Cash model also needs to be cooperative-aware or globally managed

// Helper function to handle common error responses
const handleServerError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ message: "Internal server error" });
};

export const recordPayment = async (req, res) => {
  try {
    // ⭐ UPDATED: Include cooperativeId in required fields
    const { cooperativeId, userId, seasonId, feeTypeId, paymentAmount } =
      req.body;

    // ⭐ UPDATED: Validate cooperativeId presence
    if (!cooperativeId || !userId || !feeTypeId || paymentAmount == null) {
      return res
        .status(400)
        .json({
          message:
            "Missing required fields (cooperativeId, userId, feeTypeId, paymentAmount)",
        });
    }

    if (paymentAmount < 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must not be negative" });
    }

    const feeType = await FeeType.findById(feeTypeId);
    if (!feeType) {
      return res.status(404).json({ message: "FeeType not found" });
    }

    // ⭐ UPDATED: Query for fee record including cooperativeId
    let feeRecord = await Fees.findOne({
      cooperativeId,
      userId,
      seasonId,
      feeTypeId,
    });

    if (!feeRecord) {
      // ⭐ UPDATED: Create new fee record including cooperativeId
      feeRecord = new Fees({
        cooperativeId,
        userId,
        seasonId,
        feeTypeId,
        amountOwed: feeType.amount,
        amountPaid: 0,
        status: "unpaid", // This will be updated by the model's pre-save hook
      });
    }

    // Increment amountPaid
    feeRecord.amountPaid += paymentAmount;

    // The status update logic is now primarily handled by the pre-save hook in the Fees model.
    // However, it's good practice to ensure `amountPaid` doesn't exceed `amountOwed` even before saving,
    // although the model's pre-save hook will also ensure correct status.
    if (feeRecord.amountPaid > feeRecord.amountOwed) {
      feeRecord.amountPaid = feeRecord.amountOwed; // Cap amountPaid at amountOwed
    }

    await feeRecord.save(); // The pre-save hook in the model will update the status and paidAt

    // ⭐ IMPORTANT: Consider how Cash is managed. If Cash is per-cooperative,
    // it should also be queried/created with cooperativeId.
    // For this example, assuming Cash is global or needs a cooperativeId field
    // if it were to be tied to a cooperative.
    let cashDoc;
    // Example if Cash is per-cooperative:
    // let cashDoc = await Cash.findOne({ cooperativeId });
    // if (!cashDoc) {
    //   cashDoc = new Cash({ cooperativeId, amount: 0 });
    // }
    // For now, keeping it as is, assuming global or implicitly handled.
    cashDoc = await Cash.findOne(); // Assuming Cash is a singleton or managed differently
    if (!cashDoc) {
      cashDoc = new Cash({ amount: 0 });
    }
    cashDoc.amount += paymentAmount;
    await cashDoc.save();

    res.status(200).json({
      message: "Payment recorded and cash updated",
      feeRecord,
      cash: cashDoc,
    });
  } catch (error) {
    handleServerError(res, error, "Error recording payment:");
  }
};

export const getFeesByUserAndSeason = async (req, res) => {
  try {
    // ⭐ UPDATED: Include cooperativeId in params
    const { cooperativeId, userId, seasonId } = req.params;

    // ⭐ UPDATED: Query for fees including cooperativeId
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
    // ⭐ IMPORTANT: This function now gets ALL fees for a specific cooperative.
    // If you truly need ALL fees across all cooperatives (e.g., for super-admin),
    // then cooperativeId would be omitted from the query.
    const { cooperativeId } = req.params; // Expect cooperativeId in params for this route

    if (!cooperativeId) {
      return res
        .status(400)
        .json({
          message:
            "cooperativeId is required to fetch all fees for a cooperative.",
        });
    }

    // ⭐ UPDATED: Query all fees for a specific cooperative
    const fees = await Fees.find({ cooperativeId })
      .populate("userId", "names")
      .populate("seasonId", "name year")
      .populate("feeTypeId", "name amount")
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(fees);
  } catch (error) {
    handleServerError(res, error, "Error fetching all fees for cooperative:");
  }
};

export const getAllFeesById = async (req, res) => {
  try {
    // ⭐ UPDATED: Include cooperativeId in params
    const { cooperativeId, userId } = req.params;

    if (!cooperativeId || !userId) {
      return res
        .status(400)
        .json({ message: "cooperativeId and userId are required." });
    }

    // ⭐ UPDATED: Query for fees including cooperativeId
    const fees = await Fees.find({ cooperativeId, userId })
      .populate("userId", "names")
      .populate("seasonId", "name year")
      .populate("feeTypeId", "name amount")
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(fees);
  } catch (error) {
    handleServerError(
      res,
      error,
      "Error fetching fees by user ID and cooperative:"
    );
  }
};

export const updateFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    // ⭐ NEW: Expect cooperativeId in req.body for authorization/scoping
    const { cooperativeId, ...updates } = req.body;

    // Basic validation
    if (!cooperativeId) {
      return res
        .status(400)
        .json({ message: "cooperativeId is required for updating a fee." });
    }

    // Prevent changing fundamental identifiers through update
    delete updates.userId;
    delete updates.seasonId;
    delete updates.feeTypeId;
    delete updates.cooperativeId; // Prevent changing the cooperativeId of a fee

    // ⭐ UPDATED: Find the fee by _id AND cooperativeId for security
    const fee = await Fees.findOne({ _id: feeId, cooperativeId });
    if (!fee) {
      return res
        .status(404)
        .json({
          message:
            "Fee not found or does not belong to the specified cooperative.",
        });
    }

    // Apply updates
    Object.assign(fee, updates);

    // The status update logic is now handled by the pre-save hook in the Fees model.
    // Just ensure amountPaid doesn't exceed amountOwed before saving.
    if (
      fee.amountPaid !== undefined &&
      fee.amountOwed !== undefined &&
      fee.amountPaid > fee.amountOwed
    ) {
      fee.amountPaid = fee.amountOwed;
    }

    await fee.save(); // The pre-save hook in the model will update the status and paidAt

    res.status(200).json({ message: "Fee updated", fee });
  } catch (error) {
    handleServerError(res, error, "Error updating fee:");
  }
};

export const deleteFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    // ⭐ NEW: Expect cooperativeId from req.body or headers/middleware for authorization
    const { cooperativeId } = req.body; // Or from req.user.cooperativeId if authentication middleware sets it

    if (!cooperativeId) {
      return res
        .status(400)
        .json({ message: "cooperativeId is required for deleting a fee." });
    }

    // ⭐ UPDATED: Delete the fee by _id AND cooperativeId for security
    const fee = await Fees.findOneAndDelete({ _id: feeId, cooperativeId });

    if (!fee) {
      return res
        .status(404)
        .json({
          message:
            "Fee not found or does not belong to the specified cooperative.",
        });
    }

    res.status(200).json({ message: "Fee deleted", fee });
  } catch (error) {
    handleServerError(res, error, "Error deleting fee:");
  }
};
