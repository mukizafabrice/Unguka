import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";
import Cash from "../models/Cash.js";

// Record or update a payment and update cash amount
export const recordPayment = async (req, res) => {
  try {
    const { userId, seasonId, feeTypeId, paymentAmount } = req.body;

    if (!userId || !seasonId || !feeTypeId || paymentAmount == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feeType = await FeeType.findById(feeTypeId);
    if (!feeType) {
      return res.status(404).json({ message: "FeeType not found" });
    }

    let feeRecord = await Fees.findOne({ userId, seasonId, feeTypeId });
    if (!feeRecord) {
      feeRecord = new Fees({
        userId,
        seasonId,
        feeTypeId,
        amountOwed: feeType.amount,
        amountPaid: 0,
        status: "unpaid",
      });
    }

    feeRecord.amountPaid += paymentAmount;

    if (feeRecord.amountPaid >= feeRecord.amountOwed) {
      feeRecord.amountPaid = feeRecord.amountOwed;
      feeRecord.status = "paid";
      feeRecord.paidAt = new Date();
    } else if (feeRecord.amountPaid > 0) {
      feeRecord.status = "partial";
      feeRecord.paidAt = null;
    } else {
      feeRecord.status = "unpaid";
      feeRecord.paidAt = null;
    }

    await feeRecord.save();

    let cashDoc = await Cash.findOne();
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
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get fees for a user in a season with balance info
export const getFeesByUserAndSeason = async (req, res) => {
  try {
    const { userId, seasonId } = req.params;

    const fees = await Fees.find({ userId, seasonId })
      .populate("feeTypeId", "name amount description")
      .lean();

    const result = fees.map((fee) => ({
      feeTypeName: fee.feeTypeId.name,
      amountOwed: fee.amountOwed,
      amountPaid: fee.amountPaid,
      amountRemaining: fee.amountOwed - fee.amountPaid,
      status: fee.status,
      paidAt: fee.paidAt,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all fees for admin view
export const getAllFees = async (req, res) => {
  try {
    const fees = await Fees.find()
      .populate("userId", "name email")
      .populate("seasonId", "name year")
      .populate("feeTypeId", "name amount")
      .exec();

    res.status(200).json(fees);
  } catch (error) {
    console.error("Error fetching all fees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update fee info (e.g. adjust amountOwed or reset payment)
export const updateFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    const updates = req.body;

    // Optional: prevent updating userId, seasonId, feeTypeId
    delete updates.userId;
    delete updates.seasonId;
    delete updates.feeTypeId;

    const fee = await Fees.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    // Apply updates
    Object.assign(fee, updates);

    // Validate amountPaid and status if amounts changed
    if (updates.amountOwed !== undefined) {
      if (fee.amountPaid > fee.amountOwed) {
        fee.amountPaid = fee.amountOwed;
      }
      fee.status =
        fee.amountPaid >= fee.amountOwed
          ? "paid"
          : fee.amountPaid > 0
          ? "partial"
          : "unpaid";
    }

    await fee.save();

    res.status(200).json({ message: "Fee updated", fee });
  } catch (error) {
    console.error("Error updating fee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a fee record
export const deleteFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    const fee = await Fees.findByIdAndDelete(feeId);

    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    res.status(200).json({ message: "Fee deleted", fee });
  } catch (error) {
    console.error("Error deleting fee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
