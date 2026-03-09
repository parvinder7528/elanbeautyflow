import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config();

const app = express();

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin:["https://elanbeauty.com.au","http://localhost:8080"],
  credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

export default app;