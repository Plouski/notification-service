const express = require("express")
const dotenv = require("dotenv")
const notificationRoutes = require("./routes/notificationRoutes")

dotenv.config()
const app = express()

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000", // le port de ton frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key"],
}));

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB");
})
.catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
});

app.use(express.json())
app.use("/api/notifications", notificationRoutes)

const PORT = process.env.PORT || 3005
app.listen(PORT, () => console.log(`Notification service is running on port ${PORT}`))