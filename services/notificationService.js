const EmailService = require('./emailService');
const SMSService = require('./smsService');
const PushNotificationService = require('./pushNotificationService');
const ApiClient = require('../utils/apiClient');
const crypto = require('crypto');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailService = EmailService;
    this.smsService = SMSService;
    this.pushService = PushNotificationService;
    this.apiClient = ApiClient;
  }

  generateResetToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  async initiatePasswordReset(user) {
    try {
      // Générer un code de réinitialisation
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = this.generateResetToken();
  
      console.log('Détails de réinitialisation :', {
        userId: user._id,
        email: user.email,
        resetCode,
        resetToken,
        phoneNumber: user.phoneNumber // Ajoutez cette ligne
      });
  
      try {
        // Stocker le token de réinitialisation via l'API client
        await this.apiClient.createPasswordResetToken(user._id, {
          resetToken,
          resetCode,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });
      } catch (tokenError) {
        logger.error('Erreur lors de l\'enregistrement du token de réinitialisation', tokenError);
        throw new Error('Impossible d\'enregistrer le token de réinitialisation');
      }
  
      // Envoyer email de réinitialisation
      const emailSent = await this.emailService.sendPasswordResetEmail(
        user,
        resetCode
      );
  
      // Initialiser les autres canaux comme non envoyés
      let smsSent = false;
      let pushSent = false;
  
      // Envoyer SMS si le numéro est disponible
      if (user.phoneNumber) {
        try {
          smsSent = await this.smsService.sendPasswordResetSMS(
            user.phoneNumber,
            resetCode
          );
        } catch (smsError) {
          logger.error('Erreur lors de l\'envoi du SMS', smsError);
          smsSent = false;
        }
      }
  
      // Envoyer notification push si le token Firebase est disponible
      if (user.firebaseToken) {
        try {
          pushSent = await this.pushService.sendPasswordResetNotification(
            user.firebaseToken
          );
        } catch (pushError) {
          logger.error('Erreur lors de l\'envoi de la notification push', pushError);
          pushSent = false;
        }
      }
  
      // Journaliser le résultat
      logger.info('Réinitialisation de mot de passe - Statut', {
        email: emailSent,
        sms: smsSent,
        push: pushSent
      });
  
      return {
        resetToken,
        resetCode,
        email: emailSent,
        sms: smsSent,
        push: pushSent
      };
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la réinitialisation de mot de passe', error);
      throw error;
    }
  }

  async sendAccountVerification(user) {
    try {
      // Générer un token de vérification
      const verificationToken = this.generateResetToken();
  
      console.log('Détails de vérification de compte :', {
        userId: user._id,
        email: user.email,
        verificationToken,
        phoneNumber: user.phoneNumber
      });
  
      try {
        // Stocker le token de vérification via l'API client
        await this.apiClient.createVerificationToken(user._id, {
          verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
        });
      } catch (tokenError) {
        logger.error('Erreur lors de l\'enregistrement du token de vérification', tokenError);
        throw new Error('Impossible d\'enregistrer le token de vérification');
      }
  
      // Envoyer email de vérification
      const emailSent = await this.emailService.sendVerificationEmail(
        user,
        verificationToken
      );
  
      // Initialiser les autres canaux comme non envoyés
      let smsSent = false;
      let pushSent = false;
  
      // Envoyer SMS si le numéro est disponible
      if (user.phoneNumber) {
        try {
          smsSent = await this.smsService.sendVerificationSMS(
            user.phoneNumber,
            verificationToken
          );
        } catch (smsError) {
          logger.error('Erreur lors de l\'envoi du SMS', smsError);
          smsSent = false;
        }
      }
  
      // Envoyer notification push si le token Firebase est disponible
      if (user.firebaseToken) {
        try {
          pushSent = await this.pushService.sendVerificationNotification(
            user.firebaseToken,
            verificationToken
          );
        } catch (pushError) {
          logger.error('Erreur lors de l\'envoi de la notification push', pushError);
          pushSent = false;
        }
      }
  
      // Journaliser le résultat
      logger.info('Vérification de compte - Statut', {
        email: emailSent,
        sms: smsSent,
        push: pushSent
      });
  
      return {
        verificationToken,
        email: emailSent,
        sms: smsSent,
        push: pushSent
      };
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la vérification de compte', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();