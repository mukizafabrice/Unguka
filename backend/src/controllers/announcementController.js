import Announcements from "../models/Announcements.js";
import Users from "../models/User.js"; // assuming members are in Users model
import nodemailer from "nodemailer";

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { userId, cooperativeId, title, description } = req.body;

    if (!userId || !title || !description || !cooperativeId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save announcement
    const newAnnouncement = await Announcements.create({
      userId,
      cooperativeId,
      title,
      description,
    });

    // Find all users in that cooperative
    const members = await Users.find({ cooperativeId }).select("email");

    if (members.length > 0) {
      // Collect emails
      const emailList = members.map((m) => m.email);

      // Prepare mail
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailList, // array works in nodemailer
        subject: `New Announcement: ${title}`,
        html: `
          <h3>${title}</h3>
          <p>${description}</p>
          <small>Sent by your cooperative</small>
        `,
      };

      // Send emails
      await transporter.sendMail(mailOptions);
    }

    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
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
