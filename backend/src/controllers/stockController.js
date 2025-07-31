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
