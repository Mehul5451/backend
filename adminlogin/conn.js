const mongoose = require("mongoose");
require("dotenv").config(); // Load from .env


mongoose.connect("mongodb+srv://mehul5451:Mehul284652@@cluster0.4awickr.mongodb.net/")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
