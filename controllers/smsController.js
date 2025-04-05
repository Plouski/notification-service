const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');
const dataService = require('../services/dataService');

/**
 * Contrôleur pour la gestion des SMS
 */
const smsController = {
  /**
   * Envoie un code OTP par SMS pour la réinitialisation de mot de passe
   */
  async sendPasswordResetOTP(req, res) {
    try {
      const { userId, phoneNumber, countryCode = '+33' } = req.body;
      
      // Format international du numéro de téléphone
      const formattedPhoneNumber = smsService.formatPhoneNumber(phoneNumber, countryCode);
      
      // Génération d'un code OTP (6 chiffres)
      const otp = smsService.generateOTP();
      
      // Stockage temporaire du code OTP (utilisation du service data pour la persistance)
      await dataService.storeOTP(userId, otp, formattedPhoneNumber);
      
      // Envoi du SMS via le service
      const result = await smsService.sendSMS({
        to: formattedPhoneNumber,
        templateName: 'password-reset',
        templateData: {
          otp,
          expiryMinutes: 15 // Validité de 15 minutes
        },
        metadata: {
          userId,
          type: 'password-reset'
        }
      });
      
      logger.info(`Password reset OTP sent to ${formattedPhoneNumber} for user ${userId}`);
      return formatResponse(res, 200, 'Code de réinitialisation envoyé avec succès', { 
        messageId: result.messageId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
    } catch (error) {
      logger.error(`Failed to send password reset OTP: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi du code de réinitialisation', null, error);
    }
  },

  /**
   * Vérifie un code OTP envoyé par SMS
   */
  async verifyOTP(req, res) {
    try {
      const { userId, otp, phoneNumber } = req.body;
      
      // Vérification du code OTP
      const isValid = await dataService.verifyOTP(userId, otp, phoneNumber);
      
      if (!isValid) {
        logger.warn(`Invalid OTP attempt for user ${userId}`);
        return formatResponse(res, 400, 'Code OTP invalide ou expiré');
      }
      
      // Suppression du code OTP après vérification réussie
      await dataService.deleteOTP(userId, phoneNumber);
      
      logger.info(`OTP verified successfully for user ${userId}`);
      return formatResponse(res, 200, 'Code OTP validé avec succès');
    } catch (error) {
      logger.error(`Failed to verify OTP: ${error.message}`);
      return formatResponse(res, 500, 'Échec de la vérification du code OTP', null, error);
    }
  },

  /**
   * Envoie un SMS personnalisé
   */
  async sendCustomSMS(req, res) {
    try {
      const { userId, phoneNumber, message, templateName } = req.body;
      
      // Envoi du SMS
      let result;
      
      if (templateName) {
        // Utilisation d'un template
        result = await smsService.sendSMS({
          to: phoneNumber,
          templateName,
          templateData: {
            userId,
            // Autres données spécifiques au template
          },
          metadata: {
            userId,
            type: 'custom',
            templateName
          }
        });
      } else {
        // Message personnalisé sans template
        result = await smsService.sendSMS({
          to: phoneNumber,
          message,
          metadata: {
            userId,
            type: 'custom'
          }
        });
      }
      
      logger.info(`Custom SMS sent to ${phoneNumber} for user ${userId}`);
      return formatResponse(res, 200, 'SMS envoyé avec succès', { messageId: result.messageId });
    } catch (error) {
      logger.error(`Failed to send custom SMS: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi du SMS', null, error);
    }
  },

  /**
   * Vérifier l'état de livraison d'un SMS
   */
  async checkDeliveryStatus(req, res) {
    try {
      const { messageId } = req.params;
      
      // Vérifier l'état de livraison via le service SMS
      const statusResult = await smsService.checkDeliveryStatus(messageId);
      
      logger.info(`Vérification du statut de livraison pour le message ${messageId}`);
      return formatResponse(res, 200, 'Statut de livraison récupéré avec succès', statusResult);
    } catch (error) {
      logger.error(`Failed to check SMS delivery status: ${error.message}`);
      return formatResponse(res, 500, 'Échec de la vérification du statut de livraison', null, error);
    }
  }
};

module.exports = smsController;