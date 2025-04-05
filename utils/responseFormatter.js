/**
 * Utilitaire pour formater les réponses API de manière cohérente
 * @param {Object} res - L'objet de réponse Express
 * @param {number} statusCode - Le code de statut HTTP
 * @param {string} message - Le message de la réponse
 * @param {Object|Array|null} data - Les données à renvoyer
 * @param {Error|null} error - L'erreur éventuelle
 * @returns {Object} La réponse formatée
 */
const formatResponse = (res, statusCode, message, data = null, error = null) => {
    // Déterminer si la réponse est un succès ou un échec
    const success = statusCode >= 200 && statusCode < 400;
    
    // Formater l'erreur si elle existe
    const formattedError = error 
      ? {
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      : null;
    
    // Préparer l'objet de réponse
    const responseBody = {
      success,
      message,
      ...(data !== null && { data }),
      ...(formattedError !== null && { error: formattedError })
    };
    
    // Envoyer la réponse
    return res.status(statusCode).json(responseBody);
  };
  
  module.exports = { formatResponse };