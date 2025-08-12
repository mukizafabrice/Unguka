import Season from "../models/Season.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Fees from "../models/Fees.js";
import FeeType from "../models/FeeType.js";

// Create a new season

export const createSeason = async (req, res) => {
  const { name, year } = req.body;

  if (!name || !year) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the same season already exists for the given year
    const existingSeason = await Season.findOne({ name, year });
    if (existingSeason) {
      return res.status(409).json({
        message: `Season '${name}' for year ${year} already exists`,
      });
    }

    const season = new Season({ name, year });
    await season.save();

    res.status(201).json({
      message: "Season created successfully",
      season,
    });
  } catch (error) {
    console.error("Error creating season:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all seasons
export const getAllSeasons = async (req, res) => {
  try {
    const seasons = await Season.find().sort({ createdAt: -1 });
    res.status(200).json(seasons);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single season
export const getSeasonById = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }
    res.status(200).json(season);
  } catch (error) {
    console.error("Error fetching season:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a season

// Update a season
// export const updateSeason = async (req, res) => {
//   const { id } = req.params;
//   const { name, year, status } = req.body; // 👈 Extract the new status field

//   // Validate ID format
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Invalid season ID" });
//   }

//   try {
//     const season = await Season.findByIdAndUpdate(
//       id,
//       { name, year, status }, // 👈 Include the new status field in the update
//       { new: true, runValidators: true } // 👈 runValidators ensures the enum check for 'status' is performed
//     );

//     if (!season) {
//       return res.status(404).json({ message: "Season not found" });
//     }

//     res.status(200).json({ message: "Season updated", season });
//   } catch (error) {
//     console.error("Error updating season:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const updateSeason = async (req, res) => {
  const { id } = req.params;
  const { name, year, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid season ID" });
  }

  try {
    const season = await Season.findById(id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    const oldStatus = season.status;
    season.name = name;
    season.year = year;
    season.status = status;
    await season.save({ runValidators: true });

    // Logic to be executed only when a season is activated for the first time
    if (status === "active" && oldStatus !== "active") {
      const members = await User.find({ role: "member" });
      console.log(`Found ${members.length} members.`);

      // Find fee types that are per-season and active
      const feeTypes = await FeeType.find({
        isPerSeason: true,
        status: "active",
      });
      console.log(`Found ${feeTypes.length} per-season fee types.`);

      const feesToInsert = [];

      if (members.length > 0 && feeTypes.length > 0) {
        for (const member of members) {
          for (const feeType of feeTypes) {
            // Check if the fee type should be auto-applied
            if (feeType.autoApplyOnCreate) {
              feesToInsert.push({
                userId: member._id,
                seasonId: season._id,
                feeTypeId: feeType._id,
                amountOwed: feeType.amount,
                status: "unpaid",
              });
            }
          }
        }

        if (feesToInsert.length > 0) {
          await Fees.insertMany(feesToInsert, { ordered: false });
          console.log(
            `Successfully inserted ${feesToInsert.length} new fee documents.`
          );
        } else {
          console.log(
            "No fees to insert because no fee types were set to auto-apply."
          );
        }
      } else {
        console.log(
          "No fees inserted because either no members or no matching fee types were found."
        );
      }
    }

    res.status(200).json({ message: "Season updated", season });
  } catch (error) {
    console.error("Error updating season:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a season
export const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }
    res.status(200).json({ message: "Season deleted successfully" });
  } catch (error) {
    console.error("Error deleting season:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
