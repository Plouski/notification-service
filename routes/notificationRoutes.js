const express = require("express")
const router = express.Router()
const NotificationController = require("../controllers/notificationController")

router.post("/email", NotificationController.sendEmail)
router.post("/sms", NotificationController.sendSMS)
router.post("/push", NotificationController.sendPush)

module.exports = router