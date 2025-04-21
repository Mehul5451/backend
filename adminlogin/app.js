require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { Admin, Event , DJ} = require("./login"); // Corrected Import

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// CORS options
const cors = require('cors');

const corsOptions = {
  origin: '*', // change this if needed
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

/* =========================
   Admin Authentication
========================= */

// Admin Login
app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Create the JWT token
    const adminToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send the token in the response
    res.status(200).json({ token: adminToken });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    const admin = await Admin.findById(decoded.userId);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized, admin not found" });
    }

    req.admin = admin; // Attach admin info to the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Protected Admin Route
app.get("/admin", authMiddleware, async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
});
// Admin Logout
app.post("/admin-logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================  
   Event Management
========================= */

// Add Event
app.post("/events", authMiddleware, async (req, res) => {
  const { title, date, time, location, description, djs, tickets, imageUrl } = req.body;

  // Validate fields
  if (!title || !date || !time || !location || !description || !djs || !tickets) {
    return res.status(400).json({ message: "Missing required event details" });
  }

  try {
    const newEvent = new Event({ title, date, time, location, description, djs, tickets, imageUrl });
    await newEvent.save();
    res.status(201).json({ message: "Event added successfully", event: newEvent });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ message: "Error saving event" });
  }
});

// Delete event
app.delete("/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the event by its ID
    const event = await Event.findByIdAndDelete(id);

    // If the event is not found
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

// Get Events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});



/* =========================
   Ticket Booking System
========================= */

// // Book Ticket
// app.post("/ticket-bookings", async (req, res) => {
//   try {
//     const { ticketType, eventId, userId } = req.body;

//     if (!ticketType || !eventId || !userId) {
//       return res.status(400).json({ error: "Missing booking details" });
//     }

//     const eventExists = await Event.findById(eventId);
//     if (!eventExists) return res.status(404).json({ error: "Event not found" });

//     const newBooking = new Booking({ ticketType, eventId, userId, status: "Pending" });
//     await newBooking.save();

//     res.status(201).json({ message: "Booking successful", booking: newBooking });
//   } catch (error) {
//     console.error("Error storing booking:", error);
//     res.status(500).json({ error: "Could not store booking" });
//   }
// });

// // Get Ticket Bookings
// app.get("/ticket-bookings", authMiddleware, async (req, res) => {
//   try {
//     const ticketBookings = await Booking.find().populate("eventId userId", "title email");
//     res.status(200).json(ticketBookings);
//   } catch (error) {
//     console.error("Error fetching ticket bookings:", error); // Log the actual error
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// // Update Booking Status
// app.put("/ticket-bookings/:id", authMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!["Pending", "Approved",  "Cancelled"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }

//     const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
//     res.json(updatedBooking);
//   } catch (error) {
//     res.status(500).json({ error: "Error updating ticket booking" });
//   }
// });

// // Delete Ticket Booking
// app.delete("/ticket-bookings/:id", authMiddleware, async (req, res) => {
//   try {
//     await Booking.findByIdAndDelete(req.params.id);
//     res.json({ message: "Ticket booking deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Error deleting ticket booking" });
//   }
// });


//dj add delete
//--------------------
app.get("/dj", async (req, res) => {
  try {
    const djs = await DJ.find();
    res.json(djs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/dj", async (req, res) => {
  const { name, genre, location, price, rating } = req.body;
  const newDJ = new DJ({ name, genre, location, price, rating });

  try {
    const savedDJ = await newDJ.save();
    res.status(201).json(savedDJ);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a DJ
app.delete("/dj/:id", async (req, res) => {
  try {
    await DJ.findByIdAndDelete(req.params.id);
    res.json({ message: "DJ deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   MongoDB Connection
========================= */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/DJBOOKING")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));


//------------------------------------
//create admin manualy
//------------------------------------
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const {Admin} = require("./login"); // Adjust the path based on your project structure

// const createAdmin = async () => {
//   try {
//     await mongoose.connect("mongodb://localhost:27017/DJBOOKING");

//     const hashedPassword = await bcrypt.hash("1111", 10); // Hash password

//     const admin = new Admin({
//       email: "admin@example.com",
//       password: hashedPassword,
//     });

//     await admin.save();
//     console.log("Admin created successfully!");
//     mongoose.connection.close();
//   } catch (error) {
//     console.error("Error creating admin:", error);
//   }
// };

// createAdmin();

