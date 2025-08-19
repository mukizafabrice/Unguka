import Announcements from "../models/Announcements.js";

// Create new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { userId, cooperativeId, title, description } = req.body;

    if (!userId || !title || !description || !cooperativeId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newAnnouncement = await Announcements.create({
      userId,
      cooperativeId,
      title,
      description,
    });

    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Failed to create announcement", error });
  }
};

// Get all announcements
export const getAnnouncements = async (req, res) => {
  const { cooperativeId } = req.query;
  let query = {};

  // Filter by cooperativeId if provided
  if (cooperativeId) {
    query.cooperativeId = cooperativeId;
  } else {
    return res.status(400).json({
      success: false,
      message: "cooperativeId is required to fetch products.",
    });
  }
  try {
    const announcements = await Announcements.find(query).populate(
      "userId",
      "names profilePicture"
    );
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements", error });
  }
};

// Get a single announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcements.findById(id).populate(
      "userId",
      "names profilePicture"
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcement", error });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcements.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete announcement", error });
  }
};

// Update an announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Announcements.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update announcement", error });
  }
};
