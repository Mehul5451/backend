const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://mehul:5451@cluster0.4awickr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});