const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/send-email-confirmation', notificationController.sendEmailConfirmation);
router.post('/send-reset-password-sms', notificationController.sendResetPasswordSms);


module.exports = router;