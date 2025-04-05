const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service pour interagir avec le data-service
 */
const dataService = {
  /**
   * URL de base du data-service
   */
  baseUrl: process.env.DATA_SERVICE_URL || 'http://localhost:5002',

  /**
   * Headers d'authentification pour les requêtes au data-service
   */
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${process.env.DATA_SERVICE_API_KEY}`,
      'Content-Type': 'application/json'
    };
  },

  /**
   * Stocker un code OTP dans le data-service
   * @param {string} userId - ID de l'utilisateur
   * @param {string} otp - Code OTP généré
   * @param {string} phoneNumber - Numéro de téléphone associé
   * @returns {Promise} Résultat de l'opération
   */
  async storeOTP(userId, otp, phoneNumber) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/otp/store`,
        {
          userId,
          otp,
          phoneNumber,
          expiresIn: 900 // 15 minutes en secondes
        },
        { headers: this.getAuthHeaders() }
      );
      
      logger.info(`OTP stored for user ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error storing OTP: ${error.message}`);
      throw new Error('Impossible de stocker le code OTP');
    }
  },

  /**
   * Vérifier un code OTP
   * @param {string} userId - ID de l'utilisateur
   * @param {string} otp - Code OTP à vérifier
   * @param {string} phoneNumber - Numéro de téléphone associé
   * @returns {Promise<boolean>} True si le code est valide
   */
  async verifyOTP(userId, otp, phoneNumber) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/otp/verify`,
        {
          userId,
          otp,
          phoneNumber
        },
        { headers: this.getAuthHeaders() }
      );
      
      return response.data.valid === true;
    } catch (error) {
      logger.error(`Error verifying OTP: ${error.message}`);
      return false;
    }
  },

  /**
   * Supprimer un code OTP après vérification réussie
   * @param {string} userId - ID de l'utilisateur
   * @param {string} phoneNumber - Numéro de téléphone associé
   * @returns {Promise} Résultat de l'opération
   */
  async deleteOTP(userId, phoneNumber) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/users/otp`,
        { 
          data: { userId, phoneNumber },
          headers: this.getAuthHeaders()
        }
      );
      
      logger.info(`OTP deleted for user ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error deleting OTP: ${error.message}`);
      // Ne pas propager l'erreur pour éviter de bloquer le flux
    }
  },

  /**
   * Enregistrer une notification dans le data-service
   * @param {Object} notificationData - Données de la notification
   * @returns {Promise} Résultat de l'opération
   */
  async logNotification(notificationData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/notifications`,
        notificationData,
        { headers: this.getAuthHeaders() }
      );
      
      logger.info(`Notification logged: ${notificationData.messageId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error logging notification: ${error.message}`);
      // Ne pas propager l'erreur pour éviter de bloquer le flux d'envoi
    }
  },

  /**
   * Mettre à jour le statut d'une notification
   * @param {string} messageId - ID du message
   * @param {string} status - Nouveau statut
   * @returns {Promise} Résultat de l'opération
   */
  async updateNotificationStatus(messageId, status) {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/notifications/${messageId}`,
        { status },
        { headers: this.getAuthHeaders() }
      );
      
      logger.info(`Notification status updated: ${messageId} -> ${status}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating notification status: ${error.message}`);
      // Ne pas propager l'erreur pour éviter de bloquer le flux
    }
  },

  /**
   * Récupérer le profil utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Profil utilisateur
   */
  async getUserProfile(userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Error fetching user profile: ${error.message}`);
      throw new Error('Impossible de récupérer le profil utilisateur');
    }
  },

  /**
   * Récupérer les détails d'un abonnement
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Détails de l'abonnement
   */
  async getSubscriptionDetails(userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/subscriptions/current`,
        { 
          headers: this.getAuthHeaders(),
          params: { userId }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Error fetching subscription details: ${error.message}`);
      throw new Error('Impossible de récupérer les détails de l\'abonnement');
    }
  }
};

module.exports = dataService;