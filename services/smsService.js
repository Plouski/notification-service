// services/smsService.js (mis à jour)
const smsConfig = require('../config/smsConfig');
const smsTemplates = require('../templates/smsTemplates');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.twilioClient = smsConfig.getClient();
  }

  async sendSMS(phoneNumber, templateName, templateData) {
    // Vérifications préliminaires
    if (!phoneNumber) {
      logger.warn('Tentative d\'envoi SMS sans numéro de téléphone');
      return false;
    }

    if (!this.twilioClient) {
      logger.error('Client Twilio non initialisé');
      return false;
    }

    if (!smsTemplates[templateName]) {
      logger.error(`Template SMS "${templateName}" non trouvé`);
      return false;
    }

    try {
      // Préparation du message
      const messageContent = smsTemplates[templateName]({
        appName: process.env.APP_NAME || 'Notre application',
        ...templateData
      });

      // Envoi du SMS
      const message = await this.twilioClient.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      logger.info(`SMS "${templateName}" envoyé à ${phoneNumber}`, { 
        messageSid: message.sid 
      });
      
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi du SMS "${templateName}"`, {
        error: error.message,
        phoneNumber: phoneNumber
      });
      
      return false;
    }
  }

  async sendVerificationSMS(phoneNumber, verificationCode) {
    return this.sendSMS(phoneNumber, 'accountVerification', {
      code: verificationCode
    });
  }

  async sendPasswordResetSMS(phoneNumber, resetCode) {
    return this.sendSMS(phoneNumber, 'passwordReset', {
      code: resetCode
    });
  }

  async sendTwoFactorAuthSMS(phoneNumber, authCode) {
    return this.sendSMS(phoneNumber, 'twoFactorAuth', {
      code: authCode
    });
  }

  async sendSubscriptionNotificationSMS(phoneNumber, planName, isStarting = true) {
    const templateName = isStarting ? 'subscriptionStarted' : 'subscriptionEnded';
    
    return this.sendSMS(phoneNumber, templateName, {
      planName
    });
  }
}

module.exports = new SMSService();