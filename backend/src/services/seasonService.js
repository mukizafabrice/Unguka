import Season from "../models/Season.js";
import Cooperative from "../models/Cooperative.js";

/**
 * Determines the current season based on the current date.
 * Season-A: September to January (inclusive) - spans from Sep 2024-Jan 2025, but when we're in 2024, Season-A is for 2025
 * Season-B: February to July (inclusive) - spans from Feb 2025-Jul 2025
 * @returns {Object} { name: 'Season-A' or 'Season-B', year: number }
 */
export const getCurrentSeasonInfo = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, so +1 for 1-12
  const year = now.getFullYear();

  let seasonName;
  let seasonYear = year;

  if (month >= 9 || month <= 1) {
    // September (9) to January (1) - this is Season-A
    // When we're in Sep-Jan of year X, Season-A is for year X+1
    seasonName = "Season-A";
    if (month >= 9) {
      // September to December: Season-A is for next year
      seasonYear = year + 1;
    }
    // January: Season-A is for current year (since it started in Sep of previous year)
  } else {
    // February (2) to July (7) - this is Season-B for current year
    seasonName = "Season-B";
  }

  return { name: seasonName, year: seasonYear };
};

/**
 * Determines the next season based on the current date.
 * @returns {Object} { name: 'Season-A' or 'Season-B', year: number }
 */
export const getNextSeasonInfo = () => {
  const currentSeason = getCurrentSeasonInfo();
  const year = currentSeason.year;

  let nextSeasonName;
  let nextYear = year;

  if (currentSeason.name === "Season-A") {
    // Current is Season-A, next is Season-B of the same year
    nextSeasonName = "Season-B";
  } else {
    // Current is Season-B, next is Season-A of next year
    nextSeasonName = "Season-A";
    nextYear = year + 1;
  }

  return { name: nextSeasonName, year: nextYear };
};

/**
 * Automatically creates seasons for all active cooperatives.
 * Creates current season and next season if they don't exist.
 * Ensures only the current season is active, deactivates all others.
 */
export const autoCreateSeasons = async () => {
  try {
    console.log("Starting automatic season creation...");

    // Get all active cooperatives
    const cooperatives = await Cooperative.find({ isActive: true });
    console.log(`Found ${cooperatives.length} active cooperatives.`);

    const currentSeasonInfo = getCurrentSeasonInfo();
    const nextSeasonInfo = getNextSeasonInfo();

    const seasonsToCreate = [currentSeasonInfo, nextSeasonInfo];

    for (const coop of cooperatives) {
      console.log(`Processing cooperative: ${coop.name} (${coop._id})`);

      // First, deactivate all existing seasons for this cooperative
      await Season.updateMany(
        { cooperativeId: coop._id, status: "active" },
        { status: "inactive" }
      );
      console.log(`Deactivated all active seasons for cooperative ${coop.name}`);

      for (const seasonInfo of seasonsToCreate) {
        // Check if season already exists
        const existingSeason = await Season.findOne({
          cooperativeId: coop._id,
          name: seasonInfo.name,
          year: seasonInfo.year,
        });

        if (!existingSeason) {
          // Create new season
          const newSeason = new Season({
            cooperativeId: coop._id,
            name: seasonInfo.name,
            year: seasonInfo.year,
            status: seasonInfo.name === currentSeasonInfo.name && seasonInfo.year === currentSeasonInfo.year ? "active" : "inactive",
          });

          await newSeason.save();
          console.log(`Created ${seasonInfo.name} ${seasonInfo.year} for cooperative ${coop.name}`);
        } else {
          // Update the status: only current season should be active
          const shouldBeActive = seasonInfo.name === currentSeasonInfo.name && seasonInfo.year === currentSeasonInfo.year;
          if (existingSeason.status !== (shouldBeActive ? "active" : "inactive")) {
            existingSeason.status = shouldBeActive ? "active" : "inactive";
            await existingSeason.save();
            console.log(`${shouldBeActive ? 'Activated' : 'Deactivated'} existing ${seasonInfo.name} ${seasonInfo.year} for cooperative ${coop.name}`);
          }
        }
      }
    }

    console.log("Automatic season creation completed successfully.");
  } catch (error) {
    console.error("Error during automatic season creation:", error);
    throw error;
  }
};

/**
 * Determines the previous season based on the current date.
 * @returns {Object} { name: 'Season-A' or 'Season-B', year: number }
 */
export const getPreviousSeasonInfo = () => {
  const currentSeason = getCurrentSeasonInfo();
  const year = currentSeason.year;

  let prevSeasonName;
  let prevYear = year;

  if (currentSeason.name === "Season-A") {
    // Current is Season-A, previous is Season-B of previous year
    prevSeasonName = "Season-B";
    prevYear = year - 1;
  } else {
    // Current is Season-B, previous is Season-A of same year
    prevSeasonName = "Season-A";
  }

  return { name: prevSeasonName, year: prevYear };
};

/**
 * Gets the active season for a specific cooperative.
 * @param {string} cooperativeId - The cooperative ID
 * @returns {Object|null} The active season or null if not found
 */
export const getActiveSeasonForCooperative = async (cooperativeId) => {
  try {
    const activeSeason = await Season.findOne({
      cooperativeId,
      status: "active",
    });

    return activeSeason;
  } catch (error) {
    console.error("Error fetching active season:", error);
    throw error;
  }
};