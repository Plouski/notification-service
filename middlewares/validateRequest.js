// middlewares/validateRequest.js
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation des données échouée', {
      errors: errors.array(),
      body: req.body
    });
    
    return res.status(400).json({
      status: 'error',
      message: 'Données invalides',
      errors: errors.array()
    });
  }
  
  next();
};

module.exports = validateRequest;