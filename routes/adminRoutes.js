import express from "express";
import admincontroller from "../controllers/admincontroller.js";
import { authMiddleware } from "../middlewear/authMiddleware.js";
const router = express.Router();

// Public routes only
router.post("/bookingcreate", admincontroller.createBooking);
router.get("/recent-bookings",authMiddleware, admincontroller.getBookingList);
router.get("/top-bookings",authMiddleware, admincontroller.getTopBookings);
router.get("/user-purchase-history",authMiddleware, admincontroller.userPurchaseHistory);
router.get("/user-service-stats",authMiddleware, admincontroller.userServiceStats);
router.get("/dashboard-stats",authMiddleware, admincontroller.dashboardStats);
 
router.get("/getalluser",authMiddleware, admincontroller.getUserAll);
router.get("/getUserById",authMiddleware, admincontroller.getUserById);

router.delete("/user",authMiddleware, admincontroller.deleteUser);

// Get bookings by user ID
router.get("/bookings/:userId", admincontroller.getBookingsByUser);
router.post("/login",admincontroller.login)
export default router;
