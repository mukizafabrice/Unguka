import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import fs from "fs";
import path from "path";
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
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Unguka API is running");
});

// APIs
app.use("/api/users", userRoutes);
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
// handle file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
