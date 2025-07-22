import express from "express";
import connectDB from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Unguka API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
