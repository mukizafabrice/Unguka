import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";
import Cash from "../models/Cash.js";

export const recordPayment = async (req, res) => {
  try {
    const { userId, seasonId, feeTypeId, paymentAmount } = req.body;

    if (!userId || !seasonId || !feeTypeId || paymentAmount == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (paymentAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must be greater than zero." });
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
      feeRecord.paidAt = feeRecord.paidAt || new Date();
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

export const getFeesByUserAndSeason = async (req, res) => {
  try {
    const { userId, seasonId } = req.params;

    const fees = await Fees.find({ userId, seasonId }).populate(
      "feeTypeId",
      "name amount description"
    );

    if (!fees || fees.length === 0) {
      return res
        .status(404)
        .json({
          message: "No fees found for this user in the specified season.",
        });
    }

    res.status(200).json(fees);
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllFees = async (req, res) => {
  try {
    const fees = await Fees.find()
      .populate("userId", "names")
      .populate("seasonId", "name year")
      .populate("feeTypeId", "name amount")
      .exec();

    res.status(200).json(fees);
  } catch (error) {
    console.error("Error fetching all fees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    const updates = req.body;

    delete updates.userId;
    delete updates.seasonId;
    delete updates.feeTypeId;

    const fee = await Fees.findById(feeId);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    Object.assign(fee, updates);

    if (updates.amountOwed !== undefined || updates.amountPaid !== undefined) {
      if (fee.amountPaid > fee.amountOwed) {
        fee.amountPaid = fee.amountOwed;
      }

      if (fee.amountPaid >= fee.amountOwed) {
        fee.status = "paid";
        fee.paidAt = fee.paidAt || new Date();
      } else if (fee.amountPaid > 0) {
        fee.status = "partial";
        fee.paidAt = null;
      } else {
        fee.status = "unpaid";
        fee.paidAt = null;
      }
    }

    await fee.save();

    res.status(200).json({ message: "Fee updated", fee });
  } catch (error) {
    console.error("Error updating fee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
