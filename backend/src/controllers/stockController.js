import Stock from "../models/Stock.js";

//  get all stocks

export const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find()
      .populate("productId", "productName")
      .exec();

    res.status(200).json(stocks);
  } catch (error) {
    console.error("Error fetching stock with products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// total cash
// ...existing code...

export const getTotalCash = async (req, res) => {
  try {
    const result = await Stock.aggregate([
      {
        $group: {
          _id: null,
          totalCash: { $sum: "$cash" }
        }
      }
    ]);
    const totalCash = result[0]?.totalCash || 0;
    res.status(200).json({ totalCash });
  } catch (error) {
    console.error("Error calculating total cash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//