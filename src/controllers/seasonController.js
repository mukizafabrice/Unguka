import Season from "../models/Season.js";

// Create a new season
export const createSeason = async (req, res) => {
  const { name, startDate, endDate } = req.body;

  if (!name || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const season = new Season({
      name: name.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    await season.save();
    res.status(201).json({ message: "Season created successfully", season });
  } catch (error) {
    console.error("Error creating season:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all seasons
export const getAllSeasons = async (req, res) => {
  try {
    const seasons = await Season.find().sort({ startDate: 1 });
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
export const updateSeason = async (req, res) => {
  const { name, startDate, endDate } = req.body;

  try {
    const season = await Season.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      { new: true }
    );

    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    res.status(200).json({ message: "Season updated", season });
  } catch (error) {
    console.error("Error updating season:", error);
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
