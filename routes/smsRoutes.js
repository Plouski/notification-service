const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middlewares/validateRequest');
const smsController = require('../controllers/smsController');

/**
 * @route POST /api/sms/reset-password
 * @desc Envoie un code OTP par SMS pour réinitialiser le mot de passe
 * @access Private (requiert authentification)
 */
router.post('/reset-password', 
  validateRequest({
    body: {
      userId: 'required|string',
      phoneNumber: 'required|string',
      countryCode: 'string|default:+33' // Code pays par défaut (France)
    }
  }),
  smsController.sendPasswordResetOTP
);

/**
 * @route POST /api/sms/verify-otp
 * @desc Vérifie un code OTP envoyé par SMS
 * @access Private (requiert authentification)
 */
router.post('/verify-otp', 
  validateRequest({
    body: {
      userId: 'required|string',
      otp: 'required|string|min:6|max:6',
      phoneNumber: 'required|string'
    }
  }),
  smsController.verifyOTP
);

/**
 * @route POST /api/sms/send
 * @desc Envoie un SMS personnalisé
 * @access Private (requiert authentification)
 */
router.post('/send', 
  validateRequest({
    body: {
      userId: 'required|string',
      phoneNumber: 'required|string',
      message: 'required|string|max:160',
      templateName: 'string'
    }
  }),
  smsController.sendCustomSMS
);

/**
 * @route GET /api/sms/delivery-status/:messageId
 * @desc Vérifie le statut de livraison d'un SMS
 * @access Private (requiert authentification)
 */
router.get('/delivery-status/:messageId', 
  smsController.checkDeliveryStatus
);

module.exports = router;