import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import cors from "cors";

// Load ENV
dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(
  cors({
    origin: ["https://www.elanbeauty.com.au","https://elanbeautyflow.vercel.app" ,"http://localhost:8080"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", adminRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

export default app;