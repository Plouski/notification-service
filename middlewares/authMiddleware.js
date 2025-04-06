// middlewares/authMiddleware.js dans notification-service
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'Aucun token d\'authentification fourni' 
    });
  }

  // Vérifier le format du token (Bearer TOKEN)
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      message: 'Format de token invalide' 
    });
  }

  const token = parts[1];

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // Passer au middleware/route suivant
    next();
  } catch (error) {
    logger.error('Erreur d\'authentification', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token invalide' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expiré' 
      });
    }

    // Erreur générique
    res.status(401).json({ 
      message: 'Non autorisé',
      error: error.message 
    });
  }
};

module.exports = authMiddleware;