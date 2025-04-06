const EmailService = require('./emailService');
const SMSService = require('./smsService');
const PushNotificationService = require('./pushNotificationService');
const crypto = require('crypto');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailService = EmailService;
    this.smsService = SMSService;
    this.pushService = PushNotificationService;
  }

  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  async sendAccountVerification(user) {
    // Générer un token de vérification
    const verificationToken = this.generateToken();

    try {
      // Envoyer email de vérification
      const emailSent = await this.emailService.sendConfirmationEmail(
        user, 
        verificationToken
      );

      // Initialiser les autres canaux comme non envoyés
      let smsSent = false;
      let pushSent = false;

      // Envoyer SMS si le numéro est disponible (ajustez selon votre modèle)
      if (user.phoneNumber) {
        smsSent = await this.smsService.sendAccountVerificationSMS(
          user.phoneNumber, 
          verificationToken
        );
      }

      // Envoyer notification push si le token Firebase est disponible (ajustez selon votre modèle)
      if (user.firebaseToken) {
        pushSent = await this.pushService.sendAccountVerificationNotification(
          user.firebaseToken
        );
      }

      // Journaliser le résultat
      logger.info('Vérification de compte - Statut', {
        email: emailSent,
        sms: smsSent,
        push: pushSent
      });

      return {
        token: verificationToken,
        email: emailSent,
        sms: smsSent,
        push: pushSent
      };
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la vérification de compte', error);
      throw error;
    }
  }

  async initiatePasswordReset(user) {
    try {
      const resetToken = this.generateToken();
  
      const emailSent = await this.emailService.sendPasswordResetEmail(user, resetToken);
      let smsSent = false;
      let pushSent = false;
  
      if (user.phoneNumber) {
        smsSent = await this.smsService.sendPasswordResetSMS(user.phoneNumber, resetToken);
      }
  
      if (user.firebaseToken) {
        pushSent = await this.pushService.sendPasswordResetNotification(user.firebaseToken);
      }
  
      logger.info('Réinitialisation de mot de passe - Statut', {
        email: emailSent,
        sms: smsSent,
        push: pushSent
      });
  
      return {
        token: resetToken,
        email: emailSent,
        sms: smsSent,
        push: pushSent
      };
    } catch (error) {
      logger.error('Erreur lors de l\'initiation de la réinitialisation de mot de passe', error);
      throw error;
    }
  }
}

// Exportation de l'instance unique
module.exports = new NotificationService();