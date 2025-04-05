const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middlewares/validateRequest');
const mailController = require('../controllers/mailController');

const emailConfirmationSchema = {
  body: {
    userId: 'required|string',
    email: 'required|email',
    username: 'string',
    confirmationToken: 'required|string'
  }
};

/**
 * @route POST /api/email/confirmation
 * @desc Envoie un email de confirmation après inscription
 * @access Private (requiert authentification)
 */
router.post('/confirmation', 
  (req, res, next) => {
    console.log('Requête reçue:', req.body);
    next();
  },
  validateRequest(emailConfirmationSchema), 
  mailController.sendConfirmationEmail
);
/**
 * @route POST /api/email/invoice
 * @desc Envoie une facture par email
 * @access Private (requiert authentification)
 */
router.post('/invoice', 
  validateRequest({
    body: {
      userId: 'required|string',
      email: 'required|email',
      invoiceId: 'required|string',
      amount: 'required|numeric',
      date: 'required|date',
      items: 'required|array'
    }
  }),
  mailController.sendInvoiceEmail
);

/**
 * @route POST /api/email/subscription-started
 * @desc Envoie une notification de début d'abonnement
 * @access Private (requiert authentification)
 */
router.post('/subscription-started', 
  validateRequest({
    body: {
      userId: 'required|string',
      email: 'required|email',
      planName: 'required|string',
      startDate: 'required|date',
      endDate: 'required|date',
      amount: 'required|numeric'
    }
  }),
  mailController.sendSubscriptionStartedEmail
);

/**
 * @route POST /api/email/subscription-ended
 * @desc Envoie une notification de fin d'abonnement
 * @access Private (requiert authentification)
 */
router.post('/subscription-ended', 
  validateRequest({
    body: {
      userId: 'required|string',
      email: 'required|email',
      planName: 'required|string',
      endDate: 'required|date'
    }
  }),
  mailController.sendSubscriptionEndedEmail
);

/**
 * @route POST /api/email/payment-failed
 * @desc Envoie une notification d'échec de paiement
 * @access Private (requiert authentification)
 */
router.post('/payment-failed', 
  validateRequest({
    body: {
      userId: 'required|string',
      email: 'required|email',
      amount: 'required|numeric',
      reason: 'string',
      nextAttempt: 'date'
    }
  }),
  mailController.sendPaymentFailedEmail
);

/**
 * @route POST /api/email/custom
 * @desc Envoie un email personnalisé
 * @access Private (requiert authentification)
 */
router.post('/custom', 
  validateRequest({
    body: {
      userId: 'required|string',
      email: 'required|email',
      subject: 'required|string',
      templateName: 'required|string',
      templateData: 'required|object'
    }
  }),
  mailController.sendCustomEmail
);

module.exports = router;