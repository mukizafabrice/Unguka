import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";
import User from "../models/User.js";

export async function assignFeeToAllUsers(feeTypeId, seasonId = null) {
  // Find the fee type by ID
  const feeType = await FeeType.findById(feeTypeId);
  if (!feeType) throw new Error("Fee type not found");

  // If fee is per-season, seasonId must be provided
  if (feeType.isPerSeason && !seasonId) {
    throw new Error("Season ID must be provided for per-season fees.");
  }

  // Find all cooperative members
  const members = await User.find({ role: "member" });
  if (members.length === 0) {
    console.warn("No members found to assign fees.");
    return;
  }

  // Prepare bulk operations to upsert fees
  const bulkOps = members.map((member) => ({
    updateOne: {
      filter: {
        userId: member._id,
        feeTypeId: feeType._id,
        ...(seasonId ? { seasonId } : { seasonId: null }),
      },
      update: {
        $setOnInsert: {
          amountOwed: feeType.amount,
          amountPaid: 0,
          status: "unpaid",
          createdAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  // Execute bulk write operation
  await Fees.bulkWrite(bulkOps, { ordered: false });
}
