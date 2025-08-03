import Cash from "../models/Cash.js";

export const getCash = async (req, res) => {
  try {
    const cash = await Cash.findOne();

    if (!cash) {
      return res.status(404).json({ message: "Cash record not found" });
    }

    res.status(200).json({
      message: "Cash retrieved successfully",
      cash,
    });
  } catch (error) {
    console.error("Error retrieving cash:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
