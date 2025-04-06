// services/pushNotificationService.js (mis à jour)
const firebaseConfig = require('../config/firebaseConfig');
const logger = require('../utils/logger');

class PushNotificationService {
  constructor() {
    this.messaging = firebaseConfig.getMessaging();
  }

  async sendPushNotification(token, notification, data = {}) {
    if (!token) {
      logger.warn('Tentative d\'envoi de notification push sans token');
      return false;
    }

    if (!this.messaging) {
      logger.error('Service Firebase Messaging non initialisé');
      return false;
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: data,
        token: token
      };

      const response = await this.messaging.send(message);
      
      logger.info('Notification push envoyée avec succès', { 
        messageId: response 
      });
      
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification push', {
        error: error.message,
        token: token
      });
      
      return false;
    }
  }

  async sendToTopic(topic, notification, data = {}) {
    if (!topic) {
      logger.warn('Tentative d\'envoi de notification push sans sujet spécifié');
      return false;
    }

    if (!this.messaging) {
      logger.error('Service Firebase Messaging non initialisé');
      return false;
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: data,
        topic: topic
      };

      const response = await this.messaging.send(message);
      
      logger.info(`Notification push envoyée au sujet ${topic}`, { 
        messageId: response 
      });
      
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de la notification push au sujet ${topic}`, {
        error: error.message
      });
      
      return false;
    }
  }

  async sendVerificationNotification(firebaseToken, verificationToken) {
    try {
      const message = {
        notification: {
          title: 'Vérification de compte',
          body: 'Cliquez pour vérifier votre compte'
        },
        data: {
          verificationToken: verificationToken
        },
        token: firebaseToken
      };
  
      const response = await admin.messaging().send(message);
      
      logger.info('Notification push de vérification envoyée');
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification push de vérification', error);
      return false;
    }
  }

  async sendAccountVerificationNotification(token) {
    return this.sendPushNotification(token, {
      title: 'Vérification de compte',
      body: 'Veuillez vérifier votre compte pour activer toutes les fonctionnalités.'
    });
  }

  async sendPasswordResetNotification(token) {
    return this.sendPushNotification(token, {
      title: 'Réinitialisation de mot de passe',
      body: 'Une demande de réinitialisation de mot de passe a été initiée.'
    });
  }

  async sendSubscriptionNotification(token, planName, isStarting = true) {
    const title = isStarting ? 'Abonnement activé' : 'Abonnement terminé';
    const body = isStarting 
      ? `Votre abonnement ${planName} est maintenant actif.` 
      : `Votre abonnement ${planName} a pris fin.`;
    
    return this.sendPushNotification(token, { title, body });
  }

  async sendAIResultNotification(token, resultType) {
    return this.sendPushNotification(token, {
      title: 'Résultat IA disponible',
      body: `Votre ${resultType} est maintenant disponible.`
    });
  }
}

module.exports = new PushNotificationService();