const { admin, messaging, isInitialized } = require('../config/firebaseConfig');
const logger = require('../utils/logger');

/**
 * Service pour l'envoi de notifications push
 */
const pushService = {
  /**
   * Envoyer une notification push à un appareil spécifique
   * @param {Object} options - Les options de la notification
   * @param {string} options.deviceToken - Token de l'appareil
   * @param {Object} options.notification - Contenu de la notification (title, body)
   * @param {Object} options.data - Données supplémentaires
   * @param {Object} options.metadata - Métadonnées pour le suivi
   * @returns {Promise} Promesse résolue avec le résultat de l'envoi
   */
  async sendPushNotification(options) {
    try {
      // Préparer le message Firebase
      const message = {
        token: options.deviceToken,
        notification: {
          title: options.notification.title,
          body: options.notification.body
        },
        data: this.prepareDataPayload(options.data),
        android: {
          priority: 'high',
          notification: {
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      // Envoyer la notification via Firebase
      const result = await messaging.send(message);

      // Enregistrer l'envoi dans la base de données pour le suivi
      await this.logPushSent(
        result, 
        options.deviceToken, 
        options.notification.title, 
        options.notification.body, 
        options.metadata
      );
      
      logger.info(`Push notification sent: ${result} to device ${options.deviceToken}`);
      return {
        messageId: result
      };
    } catch (error) {
      logger.error(`Error sending push notification: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Envoyer une notification push à un sujet (topic)
   * @param {Object} options - Les options de la notification
   * @param {string} options.topic - Nom du sujet
   * @param {Object} options.notification - Contenu de la notification (title, body)
   * @param {Object} options.data - Données supplémentaires
   * @param {Object} options.metadata - Métadonnées pour le suivi
   * @returns {Promise} Promesse résolue avec le résultat de l'envoi
   */
  async sendTopicNotification(options) {
    try {
      // Préparer le message Firebase
      const message = {
        topic: options.topic,
        notification: {
          title: options.notification.title,
          body: options.notification.body
        },
        data: this.prepareDataPayload(options.data),
        android: {
          priority: 'high',
          notification: {
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      // Envoyer la notification via Firebase
      const result = await messaging.send(message);

      // Enregistrer l'envoi dans la base de données pour le suivi
      await this.logPushSent(
        result, 
        `topic:${options.topic}`, 
        options.notification.title, 
        options.notification.body, 
        options.metadata
      );
      
      logger.info(`Push notification sent: ${result} to topic ${options.topic}`);
      return {
        messageId: result
      };
    } catch (error) {
      logger.error(`Error sending topic push notification: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Abonner un appareil à un sujet
   * @param {string} deviceToken - Token de l'appareil
   * @param {string} topic - Nom du sujet
   * @returns {Promise} Promesse résolue avec le résultat de l'abonnement
   */
  async subscribeToTopic(deviceToken, topic) {
    try {
      // Abonner le token au topic via Firebase
      const result = await messaging.subscribeToTopic(deviceToken, topic);
      
      logger.info(`Device ${deviceToken} subscribed to topic ${topic}`);
      return {
        success: result.successCount > 0,
        successCount: result.successCount,
        failureCount: result.failureCount
      };
    } catch (error) {
      logger.error(`Error subscribing to topic: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Désabonner un appareil d'un sujet
   * @param {string} deviceToken - Token de l'appareil
   * @param {string} topic - Nom du sujet
   * @returns {Promise} Promesse résolue avec le résultat du désabonnement
   */
  async unsubscribeFromTopic(deviceToken, topic) {
    try {
      // Désabonner le token du topic via Firebase
      const result = await messaging.unsubscribeFromTopic(deviceToken, topic);
      
      logger.info(`Device ${deviceToken} unsubscribed from topic ${topic}`);
      return {
        success: result.successCount > 0,
        successCount: result.successCount,
        failureCount: result.failureCount
      };
    } catch (error) {
      logger.error(`Error unsubscribing from topic: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Préparer les données pour le payload Firebase
   * @param {Object} data - Données à envoyer
   * @returns {Object} Données formatées pour Firebase
   */
  prepareDataPayload(data) {
    // Firebase exige que toutes les valeurs de données soient des chaînes
    const formattedData = {};
    
    // Si data est vide, retourner un objet vide
    if (!data) return formattedData;
    
    // Convertir toutes les valeurs en chaînes
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value === null || value === undefined) {
        formattedData[key] = '';
      } else if (typeof value === 'object') {
        formattedData[key] = JSON.stringify(value);
      } else {
        formattedData[key] = String(value);
      }
    });
    
    return formattedData;
  },

  /**
   * Enregistrer l'envoi d'une notification push dans la base de données
   * @param {string} messageId - ID du message
   * @param {string} recipient - Token de l'appareil ou nom du sujet
   * @param {string} title - Titre de la notification
   * @param {string} body - Corps de la notification
   * @param {Object} metadata - Métadonnées
   */
  async logPushSent(messageId, recipient, title, body, metadata = {}) {
    try {
      // Importer le service de données
      const dataService = require('./dataService');
      
      // Enregistrer l'envoi
      await dataService.logNotification({
        channel: 'push',
        messageId,
        recipient,
        content: { title, body },
        status: 'sent',
        metadata
      });
    } catch (error) {
      logger.error(`Error logging push notification: ${error.message}`);
      // Ne pas bloquer l'envoi si l'enregistrement échoue
    }
  }
};

module.exports = pushService;