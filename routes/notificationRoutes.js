// routes/notificationRoutes.js (mis à jour)
const express = require('express');
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { body, validationResult } = require('express-validator');
const rateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({ errors: errors.array() });
  };
};

// Routes d'authentification et de réinitialisation (sans auth requise)
router.post(
  '/account-verification', 
  [
    body('email').isEmail().withMessage('Email invalide')
  ],
  validateRequest,
  (req, res) => NotificationController.sendAccountVerification(req, res)
);

router.post(
  '/password-reset', 
  // rateLimiter({ 
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 3, // 3 requêtes max
  //   message: 'Trop de tentatives de réinitialisation de mot de passe, veuillez réessayer plus tard.'
  // }),
  validate([
    body('email').isEmail().withMessage('Email invalide')
  ]),
  (req, res) => NotificationController.initiatePasswordReset(req, res)
);

// Routes protégées par authentification
// Ces routes sont généralement appelées par d'autres services, pas directement par le client
router.post(
  '/subscription-started',
  authMiddleware,
  validate([
    body('userId').isString().notEmpty().withMessage('ID utilisateur requis'),
    body('subscriptionData').isObject().withMessage('Données d\'abonnement requises'),
    body('subscriptionData.planName').isString().notEmpty().withMessage('Nom du plan requis'),
    body('subscriptionData.startDate').isString().notEmpty().withMessage('Date de début requise'),
    body('subscriptionData.nextBillingDate').isString().notEmpty().withMessage('Date de prochain paiement requise'),
    body('subscriptionData.amount').isNumeric().withMessage('Montant requis'),
    body('subscriptionData.billingPeriod').isString().notEmpty().withMessage('Période de facturation requise')
  ]),
  (req, res) => NotificationController.sendSubscriptionStarted(req, res)
);

router.post(
  '/subscription-ended',
  authMiddleware,
  validate([
    body('userId').isString().notEmpty().withMessage('ID utilisateur requis'),
    body('subscriptionData').isObject().withMessage('Données d\'abonnement requises'),
    body('subscriptionData.planName').isString().notEmpty().withMessage('Nom du plan requis'),
    body('subscriptionData.endDate').isString().notEmpty().withMessage('Date de fin requise')
  ]),
  (req, res) => NotificationController.sendSubscriptionEnded(req, res)
);

router.post(
  '/invoice',
  authMiddleware,
  validate([
    body('userId').isString().notEmpty().withMessage('ID utilisateur requis'),
    body('invoiceData').isObject().withMessage('Données de facture requises'),
    body('invoiceData.invoiceNumber').isString().notEmpty().withMessage('Numéro de facture requis'),
    body('invoiceData.invoiceDate').isString().notEmpty().withMessage('Date de facture requise'),
    body('invoiceData.billingPeriod').isString().notEmpty().withMessage('Période de facturation requise'),
    body('invoiceData.items').isArray().withMessage('Éléments de facture requis'),
    body('invoiceData.totalHT').isNumeric().withMessage('Total HT requis'),
    body('invoiceData.vatRate').isNumeric().withMessage('Taux de TVA requis'),
    body('invoiceData.vatAmount').isNumeric().withMessage('Montant de TVA requis'),
    body('invoiceData.totalTTC').isNumeric().withMessage('Total TTC requis')
  ]),
  (req, res) => NotificationController.sendInvoice(req, res)
);

router.post(
  '/payment-failed',
  authMiddleware,
  validate([
    body('userId').isString().notEmpty().withMessage('ID utilisateur requis'),
    body('paymentData').isObject().withMessage('Données de paiement requises'),
    body('paymentData.planName').isString().notEmpty().withMessage('Nom du plan requis'),
    body('paymentData.failureReason').isString().notEmpty().withMessage('Raison d\'échec requise')
  ]),
  (req, res) => NotificationController.sendPaymentFailed(req, res)
);

router.post(
  '/ai-notification',
  authMiddleware,
  validate([
    body('userId').isString().notEmpty().withMessage('ID utilisateur requis'),
    body('resultData').isObject().withMessage('Données de résultat requises'),
    body('resultData.resultType').isString().notEmpty().withMessage('Type de résultat requis')
  ]),
  (req, res) => NotificationController.sendAINotification(req, res)
);

module.exports = router;