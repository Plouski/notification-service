// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes par défaut
    max: 100, // Limite par défaut
    standardHeaders: true, // Inclure les headers standards
    legacyHeaders: false, // Désactiver les headers legacy
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    handler: (req, res, next, options) => {
      logger.warn('Rate limit dépassé', {
        ip: req.ip,
        path: req.path,
        headers: req.headers
      });
      
      res.status(429).json({
        status: 'error',
        message: options.message
      });
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

module.exports = createRateLimiter;