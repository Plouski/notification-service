// index.js (mis à jour)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const notificationRoutes = require('./routes/notificationRoutes');
const rateLimiter = require('./middlewares/rateLimiter');
const ResponseFormatter = require('./utils/responseFormatter');

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares de sécurité
app.use(helmet()); // Protection des headers HTTP
app.use(cors()); // Configuration CORS
app.use(express.json()); // Parsing du JSON
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // Logging des requêtes HTTP

// Rate limiting global
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes max par 15 minutes
}));

// Routes API
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'notification-service',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route 404
app.use((req, res) => {
  const response = ResponseFormatter.error('Route non trouvée', null, 404);
  res.status(404).json(response);
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  logger.error('Erreur non gérée', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  const response = ResponseFormatter.error(
    err.message || 'Une erreur inattendue est survenue',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
    err.statusCode || 500
  );
  
  res.status(response.statusCode).json(response);
});

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejet de promesse non géré', { 
    reason: reason.toString(), 
    stack: reason.stack 
  });
});

// Gestion des exceptions non gérées
process.on('uncaughtException', (error) => {
  logger.error('Exception non gérée', { 
    error: error.message, 
    stack: error.stack 
  });
  
  // En production, on pourrait vouloir redémarrer proprement
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;