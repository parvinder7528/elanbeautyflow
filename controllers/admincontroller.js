import { schemaModel } from "../models/index.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import mongoose from "mongoose";
const admincontroller = {
  createBooking: async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        serviceId,
        bookingDate,
        timeSlot,
        guestCount,
        price,
        location,
        notes,
      } = req.body;

      // 1️⃣ Validation
      if (
        !name ||
        !email ||
        !phone ||
        !serviceId ||
        !bookingDate ||
        !timeSlot ||
        !guestCount ||
        !price ||
        !location
      ) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be filled",
        });
      }

      const normalizedDate = new Date(bookingDate);

      // 2️⃣ Check if email already exists
      const existingUser = await schemaModel.UserModel.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists. Please use a different email.",
        });
      }



      // 3️⃣ Create new user
      const user = await schemaModel.UserModel.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 1
      });

      const existingBooking = await schemaModel.BookingModel.findOne({
        userId: user._id,
        bookingDate: normalizedDate,
        timeSlot,
      });

      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked for the selected date",
        });
      }

      const booking = await schemaModel.BookingModel.create({
        userId: user._id,
        bookingDate: normalizedDate,
        serviceName: serviceId,
        timeSlot,
        guestCount,
        price,
        location,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: {
          booking,
          user,
        },
      });
    } catch (error) {
      console.error("CREATE BOOKING ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
        
      });
    }
  },


  getUserAll: async (req, res) => {
    try {
      const users = await schemaModel.UserModel.find({ role: 1 }); // fetch all users from database
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error: Unable to fetch users",
        error: error.message,
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID",
        });
      }

      const user = await schemaModel.UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } }
      ]);

      if (!user || user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user[0], // aggregate returns an array
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error: Unable to fetch user",
        error: error.message,
      });
    }
  },


  deleteUser: async (req, res) => {
    try {
      console.log("şsssss")
      const { userId } = req.query;
      console.log(userId)
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID",
        });
      }

      // Check if user exists using aggregation
      const user = await schemaModel.UserModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(userId) }
        }
      ]);

      if (!user || user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Delete the user
      await schemaModel.UserModel.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error: Unable to delete user",
        error: error.message,
      });
    }
  },

  getBookingsByUser: async (req, res) => {
    try {
      const userId = req.params._id;

      const bookings = await schemaModel.BookingModel.find({ userId: new mongoose.Types.ObjectId(userId) });
      // Assuming `user` field in BookingModel stores user ID

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error: Unable to fetch bookings",
        error: error.message,
      });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const user = await schemaModel.UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role !== 0) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "Password not set",
        });
      }
      console.log(password.toString())
      console.log(user.password)
      // 🔐 bcrypt compare (SAFE)
      const isMatch = await bcrypt.compare(password.toString(), user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
 getBookingList: async (req, res) => {
  try {
    const user = req.user;

    // Normalize location
    const location = user?.location?.toLowerCase().trim() || "";

    // Replace dash or spaces for flexible match
    const locationRegex = location.replace(/[-\s]/g, "[-\\s]?");

    const bookings = await schemaModel.BookingModel.find({
      location: {
        $regex: locationRegex,
        $options: "i"
      }
    })
      .populate("userId", "name email phone createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recent bookings",
      error: error.message,
    });
  }
},
getTopBookings: async (req, res) => {
  try {
    const user = req.user;

    const location = user?.location?.toLowerCase().trim() || "";

    // make flexible regex (regent-park → regent[-\s]?park)
    const locationRegex = location.replace(/[-\s]/g, "[-\\s]?");

    const topServices = await schemaModel.BookingModel.aggregate([
      {
        $match: {
          location: {
            $regex: locationRegex,
            $options: "i"
          }
        }
      },
      {
        $group: {
          _id: "$serviceName",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$price" }
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      data: topServices
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching top services",
      error: error.message
    });
  }
},
  userPurchaseHistory: async (req, res) => {
    try {
      const user = req.user;

      const location = user?.location?.toLowerCase() || "";

      const services = await schemaModel.BookingModel.find({
        location: {
          $regex: location.slice(0, Math.ceil(location.length * 0.6)),
          $options: "i"
        }
      })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      const formatted = services.map((item) => ({
        id: item._id,
        name: item.userId?.name,
        email: item.userId?.email,
        service: item.serviceName,
        purchaseDate: item.createdAt,
        price: item.price,
        status: item.status,
      }));

      res.status(200).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching purchased services",
        error: error.message,
      });
    }
  },
  userServiceStats: async (req, res) => {
    try {
      const user = req.user

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const next3Days = new Date();
      next3Days.setDate(today.getDate() + 3);
      const location = user?.location?.toLowerCase() || "";


      const stats = await schemaModel.BookingModel.aggregate([
        {
          $match: {
            location: {
              $regex: location.slice(0, Math.ceil(location.length * 0.6)),
              $options: "i"
            }
          }
        },
        {
          $addFields: {
            bookingOnlyDate: {
              $dateTrunc: {
                date: "$bookingDate",
                unit: "day"
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },

            expired: {
              $sum: {
                $cond: [
                  { $lt: ["$bookingOnlyDate", today] },
                  1,
                  0
                ]
              }
            },

            expiring: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$bookingOnlyDate", today] },
                      { $lte: ["$bookingOnlyDate", next3Days] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            active: {
              $sum: {
                $cond: [
                  { $gt: ["$bookingOnlyDate", next3Days] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: stats[0] || {
          total: 0,
          active: 0,
          expiring: 0,
          expired: 0
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching booking stats",
        error: error.message
      });
    }
  },
  dashboardStats: async (req, res) => {
    try {
      const now = new Date();

      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const user = req.user
      const location = user?.location?.toLowerCase() || "";

      // ================= CLIENTS =================
      const totalClients = await schemaModel.UserModel.countDocuments({ role: 1 });

      const lastMonthClients = await schemaModel.UserModel.countDocuments({ role: 1 }, {
        createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
      });

      const thisMonthClients = await schemaModel.UserModel.countDocuments({ role: 1 }, {
        createdAt: { $gte: firstDayThisMonth },
      });

      const clientGrowth = lastMonthClients
        ? Number(
          (((thisMonthClients - lastMonthClients) / lastMonthClients) * 100).toFixed(1)
        )
        : 0;

      // ================= APPOINTMENTS =================
      const totalAppointments = await schemaModel.BookingModel.countDocuments();

      const lastMonthAppointments = await schemaModel.BookingModel.countDocuments({
        createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
      });

      const thisMonthAppointments = await schemaModel.BookingModel.countDocuments({
        createdAt: { $gte: firstDayThisMonth },
      });

      const appointmentGrowth = lastMonthAppointments
        ? Number(
          (((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100).toFixed(1)
        )
        : 0;

      // ================= RESPONSE =================
      res.status(200).json({
        success: true,
        data: [
          {
            title: "Total Clients",
            value: totalClients,
            growth: clientGrowth,
          },
          {
            title: "Total Appointments",
            value: totalAppointments,
            growth: appointmentGrowth,
          },
          {
            title: "Average Rating",
            value: 0,
            growth: 0,
          },
        ],
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Dashboard stats error",
        error: error.message,
      });
    }
  }

};

export default admincontroller;
