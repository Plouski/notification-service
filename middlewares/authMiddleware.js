const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Middleware d'authentification pour sécuriser les routes
 * Vérifie la présence et la validité du JWT dans les headers
 */
const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return formatResponse(res, 401, 'Authentification requise', null, {
        message: 'Token d\'authentification manquant'
      });
    }

    // Vérifier le format du token (Bearer TOKEN)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return formatResponse(res, 401, 'Format de token invalide', null, {
        message: 'Le token doit être au format "Bearer [token]"'
      });
    }

    const token = parts[1];
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Important: Ne pas vérifier l'utilisateur en base de données ici
    // Nous faisons confiance au token si la signature est valide
    
    // Ajouter les données du token à l'objet de requête
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    
    // Journaliser l'accès
    logger.info(`Authentification réussie pour ${decoded.email}`);

    next();
  } catch (error) {
    logger.error('Erreur d\'authentification', error);

    // Gestion des erreurs spécifiques du token
    if (error.name === 'JsonWebTokenError') {
      return formatResponse(res, 401, 'Token invalide', null, {
        message: 'Le token d\'authentification est invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return formatResponse(res, 401, 'Token expiré', null, {
        message: 'Le token d\'authentification a expiré'
      });
    }

    // Erreur générique
    return formatResponse(res, 401, 'Non autorisé', null, {
      message: 'Erreur lors de l\'authentification',
      details: error.message
    });
  }
};

/**
 * Middleware pour vérifier les droits d'accès basés sur les rôles
 * @param {Array} allowedRoles - Tableau des rôles autorisés
 * @returns {Function} Middleware Express
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Vérifier si l'authentification a été effectuée
    if (!req.user) {
      return formatResponse(res, 401, 'Authentification requise', null, {
        message: 'Veuillez vous authentifier avant d\'accéder à cette ressource'
      });
    }

    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Tentative d'accès non autorisé: User ${req.user.id} (${req.user.role}) a tenté d'accéder à ${req.originalUrl}`);
      return formatResponse(res, 403, 'Accès refusé', null, {
        message: 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource'
      });
    }

    // Utilisateur autorisé, continuer
    next();
  };
};

module.exports = { authMiddleware, checkRole };