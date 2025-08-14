import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";
import User from "../models/User.js";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation

export async function assignFeeToAllUsers(feeTypeId, seasonId = null, cooperativeId) { // ⭐ ADDED cooperativeId parameter
  try {
    // ⭐ Basic validation for cooperativeId
    if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
      throw new Error("Valid Cooperative ID is required to assign fees.");
    }

    // ⭐ Find the fee type by ID and cooperativeId
    // Ensure the fee type itself belongs to the cooperative we're working with
    const feeType = await FeeType.findOne({ _id: feeTypeId, cooperativeId });
    if (!feeType) {
      throw new Error("Fee type not found for the specified cooperative.");
    }

    // If fee is per-season, seasonId must be provided and valid
    if (feeType.isPerSeason && !seasonId) {
      throw new Error("Season ID must be provided for per-season fees.");
    }
    if (seasonId && !mongoose.Types.ObjectId.isValid(seasonId)) {
      throw new Error("Invalid Season ID format.");
    }

    // ⭐ Find all cooperative members for the given cooperativeId
    // Only members within this cooperative will receive the fee assignment
    const members = await User.find({ role: "member", cooperativeId });
    if (members.length === 0) {
      console.warn(`No members found in cooperative ${cooperativeId} to assign fees.`);
      return; // Exit if no members are found
    }

    // Prepare bulk operations to upsert fees
    const bulkOps = members.map((member) => ({
      updateOne: {
        filter: {
          userId: member._id,
          feeTypeId: feeType._id,
          cooperativeId: cooperativeId, // ⭐ Include cooperativeId in the filter for the Fees collection
          ...(seasonId ? { seasonId } : { seasonId: null }), // Conditionally add seasonId or null
        },
        update: {
          $setOnInsert: { // Only set these fields if a new document is inserted
            amountOwed: feeType.amount,
            amountPaid: 0,
            status: "unpaid",
            createdAt: new Date(),
          },
          // If you need to update existing fields on a match, use $set here.
          // For now, this is strictly upserting if not found.
        },
        upsert: true, // Create a new document if no match is found
      },
    }));

    // Execute bulk write operation
    if (bulkOps.length > 0) {
      const result = await Fees.bulkWrite(bulkOps, { ordered: false });
      console.log(`Bulk fee assignment for cooperative ${cooperativeId} completed. Upserted: ${result.upsertedCount}, Matched: ${result.matchedCount}`);
    } else {
      console.log("No bulk operations to perform for fee assignment.");
    }
  } catch (error) {
    console.error("Error in assignFeeToAllUsers:", error);
    throw error; // Re-throw to be caught by the calling controller (e.g., createFeeType)
  }
}
