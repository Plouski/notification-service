// utils/responseFormatter.js
/**
 * Formatage des réponses API
 */
class ResponseFormatter {
    /**
     * Formate une réponse réussie
     * @param {Object} data - Données à renvoyer
     * @param {String} message - Message de succès
     * @param {Number} statusCode - Code HTTP (défaut: 200)
     */
    static success(data = null, message = 'Opération réussie', statusCode = 200) {
      return {
        status: 'success',
        message,
        data,
        statusCode
      };
    }
  
    /**
     * Formate une réponse d'erreur
     * @param {String} message - Message d'erreur
     * @param {Object} errors - Détails des erreurs
     * @param {Number} statusCode - Code HTTP (défaut: 400)
     */
    static error(message = 'Une erreur est survenue', errors = null, statusCode = 400) {
      return {
        status: 'error',
        message,
        errors,
        statusCode
      };
    }
  
    /**
     * Format une réponse pour la pagination
     * @param {Array} data - Données paginées
     * @param {Number} page - Page actuelle
     * @param {Number} limit - Limite par page
     * @param {Number} total - Total d'éléments
     */
    static paginated(data, page, limit, total) {
      const totalPages = Math.ceil(total / limit);
      
      return {
        status: 'success',
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    }
  }
  
  module.exports = ResponseFormatter;