const mongoose = require("mongoose");
require("dotenv").config(); // Load from .env

const { Event } = require("../adminlogin/login"); // Keep this if Event is used somewhere

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
