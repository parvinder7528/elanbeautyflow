import { verifyToken } from "../utils/jwt.js";
import userModel from "../models/User.js"
export const authMiddleware =async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ success: false, message: "Invalid or expired token" });
const user = await userModel.findById(decoded.id)
  req.user = user; // attach user info to request
  next();
};
