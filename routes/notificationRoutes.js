const express = require('express');
const NotificationController = require('../controllers/notificationController');
const { body, validationResult } = require('express-validator');

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

// Routes
router.post(
  '/account-verification', 
  validate([
    body('email').isEmail().withMessage('Email invalide')
  ]),
  (req, res) => NotificationController.sendAccountVerification(req, res)
);

router.post(
  '/password-reset', 
  validate([
    body('email').isEmail().withMessage('Email invalide')
  ]),
  (req, res) => NotificationController.initiatePasswordReset(req, res)
);

module.exports = router;