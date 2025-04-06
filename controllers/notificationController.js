const notificationService = require('../services/notificationService');
const ApiClient = require('../utils/apiClient');
const logger = require('../utils/logger');

class NotificationController {
  async sendAccountVerification(req, res) {
    try {
      const { email } = req.body;

      try {
        const user = await ApiClient.getUserByEmail(email);
        const result = await notificationService.sendAccountVerification(user);

        res.status(200).json({
          message: 'Notifications de vérification envoyées',
          channels: {
            email: result.email,
            sms: result.sms,
            push: result.push
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Aucun utilisateur trouvé avec cet email' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi des notifications de vérification', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi des notifications de vérification',
        error: error.message
      });
    }
  }

  async initiatePasswordReset(req, res) {
    try {
      const { email } = req.body;

      try {
        const user = await ApiClient.getUserByEmail(email);
        const result = await notificationService.initiatePasswordReset(user);

        res.status(200).json({
          message: 'Notifications de réinitialisation de mot de passe envoyées',
          channels: {
            email: result.email,
            sms: result.sms,
            push: result.push
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Aucun utilisateur trouvé avec cet email' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'initiation de la réinitialisation de mot de passe', error);
      res.status(500).json({ 
        message: 'Échec de l\'initiation de la réinitialisation de mot de passe',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();