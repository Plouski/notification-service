const crypto = require('crypto');
const { twilioClient, defaultSmsOptions } = require('../config/smsConfig');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

/**
 * Service pour l'envoi de SMS
 */
const smsService = {
  /**
   * Envoyer un SMS
   * @param {Object} options - Les options du SMS
   * @param {string} options.to - Destinataire
   * @param {string} options.message - Message (si pas de template)
   * @param {string} options.templateName - Nom du template à utiliser
   * @param {Object} options.templateData - Données pour le template
   * @param {Object} options.metadata - Métadonnées pour le suivi
   * @returns {Promise} Promesse résolue avec le résultat de l'envoi
   */
  async sendSMS(options) {
    try {
      let messageBody;

      // Déterminer le contenu du message (template ou message direct)
      if (options.templateName) {
        messageBody = await this.prepareSmsContent(options.templateName, options.templateData);
      } else {
        messageBody = options.message;
      }

      // Configuration du SMS
      const smsOptions = {
        to: options.to,
        from: defaultSmsOptions.from,
        body: messageBody
      };

      // Vérifier si Twilio est correctement configuré
      if (!twilioClient.messages || !twilioClient.messages.create) {
        logger.warn('SMS sending attempted but Twilio is not properly configured');
        
        // Mode simulation pour le développement
        const fakeResult = {
          sid: `FAKE_${Date.now()}`,
          status: 'simulated',
          body: messageBody,
          to: options.to
        };
        
        // Enregistrer quand même pour le suivi
        await this.logSmsSent(fakeResult.sid, options.to, messageBody, {
          ...options.metadata,
          simulated: true
        });
        
        logger.info(`[SIMULATED] SMS would be sent to ${options.to}`);
        return {
          messageId: fakeResult.sid,
          status: fakeResult.status,
          simulated: true
        };
      }

      // Envoi du SMS via Twilio
      const result = await twilioClient.messages.create(smsOptions);

      // Enregistrer l'envoi dans la base de données pour le suivi
      await this.logSmsSent(result.sid, options.to, messageBody, options.metadata);
      
      logger.info(`SMS sent: ${result.sid} to ${options.to}`);
      return {
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      logger.error(`Error sending SMS: ${error.message}`, error);
      
      // Retourner une réponse plus informative au lieu de propager l'erreur
      return {
        error: error.message,
        status: 'failed',
        to: options.to
      };
    }
  },

  /**
   * Préparer le contenu d'un SMS à partir d'un template
   * @param {string} templateName - Nom du template
   * @param {Object} data - Données pour le template
   * @returns {string} Contenu du SMS
   */
  async prepareSmsContent(templateName, data) {
    try {
      // Chemin du template
      const templatePath = path.join(__dirname, '../templates/smsTemplates.js');
      
      // Vérifier si le fichier de templates existe
      if (!fs.existsSync(templatePath)) {
        throw new Error(`SMS templates file not found: ${templatePath}`);
      }

      // Charger tous les templates SMS
      const templates = require(templatePath);
      
      // Vérifier si le template demandé existe
      if (!templates[templateName]) {
        throw new Error(`SMS template not found: ${templateName}`);
      }

      // Compiler le template avec handlebars
      const templateCompiler = handlebars.compile(templates[templateName]);
      const content = templateCompiler(data);

      // Vérifier la longueur du message (limite standard SMS: 160 caractères)
      if (content.length > 160) {
        logger.warn(`SMS content exceeds 160 characters: ${content.length}`);
      }

      return content;
    } catch (error) {
      logger.error(`Error preparing SMS content: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Générer un code OTP pour réinitialisation de mot de passe
   * @param {number} length - Longueur du code OTP (défaut: 6)
   * @returns {string} Code OTP
   */
  generateOTP(length = 6) {
    // Générer un code numérique aléatoire
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    
    // Utiliser crypto pour une génération sécurisée
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    
    // Mettre à l'échelle le nombre dans la plage souhaitée
    const otp = min + (randomNumber % (max - min));
    
    return otp.toString();
  },

  /**
   * Formater un numéro de téléphone en format international
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} countryCode - Code pays (ex: +33)
   * @returns {string} Numéro de téléphone formaté
   */
  formatPhoneNumber(phoneNumber, countryCode = '+33') {
    // Supprimer les espaces, tirets et autres caractères non numériques
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Supprimer le 0 initial si présent et si un code pays est fourni
    if (countryCode && cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Ajouter le code pays si le numéro n'en a pas déjà un
    if (!phoneNumber.startsWith('+')) {
      return `${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
  },

  /**
   * Vérifier l'état de livraison d'un SMS
   * @param {string} messageId - ID du message
   * @returns {Promise} Promesse résolue avec le statut du message
   */
  async checkDeliveryStatus(messageId) {
    try {
      // Vérifier si le client Twilio est disponible
      if (!twilioClient.messages) {
        logger.warn('Cannot check SMS status: Twilio client not properly initialized');
        return {
          messageId: messageId,
          status: 'unknown',
          error: 'Twilio client not available'
        };
      }

      // Récupérer le message à partir de son ID via Twilio
      const message = await twilioClient.messages(messageId).fetch();
      
      // Mettre à jour le statut dans la base de données
      await this.updateSmsStatus(messageId, message.status);
      
      logger.info(`SMS status checked: ${messageId} - ${message.status}`);
      return {
        messageId: message.sid,
        status: message.status,
        createdAt: message.dateCreated,
        updatedAt: message.dateUpdated
      };
    } catch (error) {
      logger.error(`Error checking SMS status: ${error.message}`, error);
      
      // Fournir un retour plus gracieux en cas d'erreur
      return {
        messageId: messageId,
        status: 'error',
        error: error.message
      };
    }
  },

  /**
   * Enregistrer l'envoi d'un SMS dans la base de données
   * @param {string} messageId - ID du message
   * @param {string} recipient - Destinataire
   * @param {string} content - Contenu du SMS
   * @param {Object} metadata - Métadonnées
   */
  async logSmsSent(messageId, recipient, content, metadata = {}) {
    try {
      // Importer le service de données
      const dataService = require('./dataService');
      
      // Enregistrer l'envoi
      await dataService.logNotification({
        channel: 'sms',
        messageId,
        recipient,
        content,
        status: 'sent',
        metadata
      });
    } catch (error) {
      logger.error(`Error logging SMS: ${error.message}`);
      // Ne pas bloquer l'envoi si l'enregistrement échoue
    }
  },

  /**
   * Mettre à jour le statut d'un SMS dans la base de données
   * @param {string} messageId - ID du message
   * @param {string} status - Nouveau statut
   */
  async updateSmsStatus(messageId, status) {
    try {
      // Importer le service de données
      const dataService = require('./dataService');
      
      // Mettre à jour le statut
      await dataService.updateNotificationStatus(messageId, status);
    } catch (error) {
      logger.error(`Error updating SMS status: ${error.message}`);
    }
  }
};

module.exports = smsService;