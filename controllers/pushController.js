const pushService = require('../services/pushService');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Contrôleur pour la gestion des notifications push
 */
const pushController = {
  /**
   * Envoie une notification push à un appareil spécifique
   */
  async sendPushNotification(req, res) {
    try {
      const { userId, deviceToken, title, body, data } = req.body;
      
      // Envoi de la notification via le service
      const result = await pushService.sendPushNotification({
        deviceToken,
        notification: {
          title,
          body
        },
        data: data || {},
        metadata: {
          userId,
          type: 'custom'
        }
      });
      
      logger.info(`Push notification sent to user ${userId}, device ${deviceToken}`);
      return formatResponse(res, 200, 'Notification push envoyée avec succès', result);
    } catch (error) {
      logger.error(`Failed to send push notification: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de la notification push', null, error);
    }
  },

  /**
   * Envoie une notification push à un sujet (topic)
   */
  async sendTopicNotification(req, res) {
    try {
      const { topic, title, body, data } = req.body;
      
      // Envoi de la notification au topic via le service
      const result = await pushService.sendTopicNotification({
        topic,
        notification: {
          title,
          body
        },
        data: data || {},
        metadata: {
          type: 'topic',
          topic
        }
      });
      
      logger.info(`Push notification sent to topic ${topic}`);
      return formatResponse(res, 200, 'Notification push envoyée au sujet avec succès', result);
    } catch (error) {
      logger.error(`Failed to send topic push notification: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de la notification push au sujet', null, error);
    }
  },

  /**
   * Abonne un appareil à un sujet
   */
  async subscribeToTopic(req, res) {
    try {
      const { userId, deviceToken, topic } = req.body;
      
      // Abonnement au topic via le service
      const result = await pushService.subscribeToTopic(deviceToken, topic);
      
      logger.info(`Device ${deviceToken} subscribed to topic ${topic} for user ${userId}`);
      return formatResponse(res, 200, 'Appareil abonné au sujet avec succès', result);
    } catch (error) {
      logger.error(`Failed to subscribe to topic: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'abonnement au sujet', null, error);
    }
  },

  /**
   * Désabonne un appareil d'un sujet
   */
  async unsubscribeFromTopic(req, res) {
    try {
      const { userId, deviceToken, topic } = req.body;
      
      // Désabonnement du topic via le service
      const result = await pushService.unsubscribeFromTopic(deviceToken, topic);
      
      logger.info(`Device ${deviceToken} unsubscribed from topic ${topic} for user ${userId}`);
      return formatResponse(res, 200, 'Appareil désabonné du sujet avec succès', result);
    } catch (error) {
      logger.error(`Failed to unsubscribe from topic: ${error.message}`);
      return formatResponse(res, 500, 'Échec du désabonnement du sujet', null, error);
    }
  },

  /**
   * Envoie une notification de résultat d'IA disponible
   */
  async sendAiResultNotification(req, res) {
    try {
      const { userId, deviceToken, resultId, modelName, processingTime } = req.body;
      
      // Envoi de la notification via le service
      const result = await pushService.sendPushNotification({
        deviceToken,
        notification: {
          title: 'Résultat IA disponible',
          body: `Le traitement de votre demande ${modelName ? `par ${modelName}` : ''} est terminé.`
        },
        data: {
          type: 'ai_result',
          resultId,
          processingTime: processingTime || null
        },
        metadata: {
          userId,
          type: 'ai_notification'
        }
      });
      
      logger.info(`AI result notification sent to user ${userId}, result ${resultId}`);
      return formatResponse(res, 200, 'Notification de résultat IA envoyée avec succès', result);
    } catch (error) {
      logger.error(`Failed to send AI result notification: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de la notification de résultat IA', null, error);
    }
  },

  /**
   * Envoie une notification concernant l'abonnement (début/fin)
   */
  async sendSubscriptionNotification(req, res) {
    try {
      const { userId, deviceToken, event, planName, daysLeft } = req.body;
      
      // Déterminer le titre et le contenu selon l'événement
      let title, body;
      
      switch (event) {
        case 'started':
          title = 'Abonnement activé';
          body = `Votre abonnement ${planName} est maintenant actif.`;
          break;
        case 'ended':
          title = 'Abonnement terminé';
          body = `Votre abonnement ${planName} est arrivé à échéance.`;
          break;
        case 'expiring':
          title = 'Abonnement bientôt expiré';
          body = `Votre abonnement ${planName} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`;
          break;
        default:
          return formatResponse(res, 400, 'Type d\'événement d\'abonnement non reconnu');
      }
      
      // Envoi de la notification via le service
      const result = await pushService.sendPushNotification({
        deviceToken,
        notification: {
          title,
          body
        },
        data: {
          type: 'subscription',
          event,
          planName,
          daysLeft: daysLeft || null
        },
        metadata: {
          userId,
          type: 'subscription_notification'
        }
      });
      
      logger.info(`Subscription notification (${event}) sent to user ${userId}`);
      return formatResponse(res, 200, 'Notification d\'abonnement envoyée avec succès', result);
    } catch (error) {
      logger.error(`Failed to send subscription notification: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de la notification d\'abonnement', null, error);
    }
  }
};

module.exports = pushController;