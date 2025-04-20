const mongoose = require("mongoose");
require("dotenv").config(); // Load from .env

const { Event } = require("../adminlogin/login"); // Keep this if Event is used somewhere

mongoose.connect("mongodb+srv://<db_username>:<db_password>@cluster0.4awickr.mongodb.net/")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
