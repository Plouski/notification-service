const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    try {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID, 
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (error) {
      logger.error('Erreur d\'initialisation Twilio', error);
    }
  }

  async sendPasswordResetSMS(phoneNumber, resetCode) {
    // Log détaillé pour le débogage
    console.log('Tentative d\'envoi SMS avec les paramètres :', {
      phoneNumber,
      resetCode,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ? 'Présent' : 'Manquant',
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER
    });

    try {
      // Validation du numéro
      if (!phoneNumber) {
        console.warn('Numéro de téléphone manquant');
        return false;
      }

      // Vérification des credentials Twilio
      if (!this.twilioClient) {
        console.error('Client Twilio non initialisé');
        return false;
      }

      // Envoi du SMS
      const message = await this.twilioClient.messages.create({
        body: `Votre code de réinitialisation est : ${resetCode}. Ce code expire dans 15 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      // Log de succès
      console.log(`SMS envoyé avec succès à ${phoneNumber}`, { 
        messageSid: message.sid 
      });

      return true;
    } catch (error) {
      // Log détaillé de l'erreur
      console.error('Erreur complète lors de l\'envoi du SMS', {
        message: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        status: error.status,
        fullError: error
      });

      return false;
    }
  }
}

module.exports = new SMSService();