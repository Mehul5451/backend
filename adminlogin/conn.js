const mongoose = require("mongoose");
require("dotenv").config(); // Load from .env


mongoose.connect("mongodb+srv://gadhadaramehul786:Mehul284652@@cluster0.vsz5ku5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
