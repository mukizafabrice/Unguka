import express from "express";
import connectDB from "./db.js";
import fs from "fs";
import path from "path";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import seasonRoutes from "./src/routes/seasonRoutes.js";
import stockRoutes from "./src/routes/stockRoutes.js";
import loanRoutes from "./src/routes/loanRoutes.js";
import productionRoutes from "./src/routes/productionRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Unguka API is running");
});
//apis
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/productions", productionRoutes);

// handle  files uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
