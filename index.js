import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config();

// Create app
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

/* ✅ SERVE FRONTEND DIST FOLDER */
// const frontendPath = path.join(__dirname, "../Frontend/dist");
// console.log(frontendPath,"frontendPathfrontendPathfrontendPath")
// app.use(express.static(frontendPath));
app.use(
  "/assets",
  express.static(path.join(__dirname, "dist/assets"))
);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// React Router support (VERY IMPORTANT)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(frontendPath, "index.html"));
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
