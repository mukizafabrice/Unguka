import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

import connectDB from "./db.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import seasonRoutes from "./src/routes/seasonRoutes.js";
import stockRoutes from "./src/routes/stockRoutes.js";
import loanRoutes from "./src/routes/loanRoutes.js";
import productionRoutes from "./src/routes/productionRoutes.js";
import salesRoutes from "./src/routes/salesRoutes.js";
import purchaseInputRoutes from "./src/routes/purchaseInputRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import plotRoutes from "./src/routes/plotRoutes.js";
import feesRoutes from "./src/routes/feesRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import cashRoutes from "./src/routes/cashRoutes.js";
import purchaseOutRoutes from "./src/routes/purchaseOutRoutes.js";
import feeTypeRoutes from "./src/routes/feeTypeRoutes.js";
import loanTransactionRoutes from "./src/routes/loanTransactionRoutes.js";
import paymentTransactionRoutes from "./src/routes/paymentTransactionRoutes.js";
import cooperativeRoutes from "./src/routes/cooperativeRoutes.js";

// Load environment variables at the very beginning
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(cors());
app.use(express.json());
const allowedOrigins = ["http://localhost:3000", "http://172.20.10.2:3000"];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.get("/", (req, res) => {
  res.send("Unguka API is running");
});
app.use("/api/users", userRoutes);
app.use("/api/cooperatives", cooperativeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/purchaseInputs", purchaseInputRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/purchaseOuts", purchaseOutRoutes);
app.use("/api/feeTypes", feeTypeRoutes);
app.use("/api/loanTransactions", loanTransactionRoutes);
app.use("/api/paymentTransactions", paymentTransactionRoutes);

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
