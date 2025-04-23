const express = require("express")
const dotenv = require("dotenv")
const notificationRoutes = require("./routes/notificationRoutes")

dotenv.config()
const app = express()

app.use(express.json())
app.use("/api/notifications", notificationRoutes)

const PORT = process.env.PORT || 3005
app.listen(PORT, () => console.log(`Notification service is running on port ${PORT}`))