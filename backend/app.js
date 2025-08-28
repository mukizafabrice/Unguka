import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // Required for __dirname in ES Modules
import { dirname } from "path"; // Required for __dirname in ES Modules

// Import database connection
import connectDB from "./db.js";

// Import all your routes
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

// --- Define __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ----------------------------------------

// --- Middleware Configuration ---

// 1. Body Parsers: Must come before routes to parse request bodies
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request bodies

// 2. CORS Configuration: IMPORTANT - Configure CORS only once and correctly
// Define only origins here
const allowedOrigins = ["http://localhost:3000", "http://192.168.1.201:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies/sessions
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "x-cooperative-id"], // Allowed headers
  })
);

// 3. Static File Serving: Makes your 'uploads' directory accessible via '/uploads' URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Routes Configuration ---

// Root API route
app.get("/", (req, res) => {
  res.send("Unguka API is running");
});

// Mount all your specific API routes
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

// --- Server Start ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
