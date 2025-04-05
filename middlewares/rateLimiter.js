const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Middleware de limitation de requêtes pour prévenir les abus et les attaques
 */
const rateLimiter = rateLimit({
  // Période de surveillance (en millisecondes)
  windowMs: 15 * 60 * 1000, // 15 minutes
  
  // Nombre maximal de requêtes par adresse IP pendant la période
  max: 100, // 100 requêtes par IP par période
  
  // Statut de réponse lors du dépassement de limite
  statusCode: 429, // Too Many Requests
  
  // Message en cas de dépassement
  message: {
    status: 'error',
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    limitResetIn: 'Réessayez après 15 minutes'
  },
  
  // Afficher le header avec la limite et le nombre restant
  standardHeaders: true, // X-RateLimit-Limit, X-RateLimit-Remaining
  
  // Ne pas utiliser les anciens headers pour rétrocompatibilité
  legacyHeaders: false,
  
  // Action lors du dépassement de la limite
  handler: (req, res, next, options) => {
    // Journaliser les abus potentiels
    logger.warn(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`);
    
    // Envoyer une réponse standard
    res.status(options.statusCode).json(options.message);
  }
});

// Exportation du middleware
module.exports = { rateLimiter };