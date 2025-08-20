import Cash from "../models/Cash.js";
import mongoose from "mongoose";

export const getCash = async (req, res) => {
  try {
    const { cooperativeId } = req.query;

    if (!cooperativeId) {
      return res
        .status(400)
        .json({ success: false, message: "Cooperative ID is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Cooperative ID format." });
    }

    const cash = await Cash.findOne({ cooperativeId: cooperativeId });

    if (!cash) {
     
      return res
        .status(404)
        .json({
          success: false,
          message: "Cash record not found for this cooperative.",
        });
    }

    res.status(200).json({
      success: true, // Consistent success flag
      message: "Cash retrieved successfully",
      data: cash, // Return the cash data under 'data' for consistency
    });
  } catch (error) {
    console.error("Error retrieving cash:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message }); // Consistent error flag
  }
};

// For example, if cash is updated daily or after specific transactions.
// export const updateCash = async (req, res) => {
//   try {
//     const { cooperativeId, amount } = req.body;
//     if (!cooperativeId || !mongoose.Types.ObjectId.isValid(cooperativeId)) {
//       return res.status(400).json({ success: false, message: "Valid Cooperative ID is required." });
//     }
//     if (typeof amount !== 'number' || amount < 0) {
//       return res.status(400).json({ success: false, message: "Amount must be a non-negative number." });
//     }
//
//     const updatedCash = await Cash.findOneAndUpdate(
//       { cooperativeId },
//       { amount },
//       { new: true, upsert: true, runValidators: true } // upsert: true creates if not found
//     );
//
//     res.status(200).json({
//       success: true,
//       message: "Cash updated successfully",
//       data: updatedCash,
//     });
//   } catch (error) {
//     console.error("Error updating cash:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };
