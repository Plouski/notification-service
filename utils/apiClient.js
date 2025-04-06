const axios = require('axios');
const logger = require('./logger');

class ApiClient {
  constructor() {
    this.dataServiceClient = axios.create({
      baseURL: process.env.DATA_SERVICE_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getUserByEmail(email) {
    try {
      console.log(`Recherche de l'utilisateur avec l'email: ${email}`);

      const response = await this.dataServiceClient.get(`/users/email/${email}`);

      console.log('Utilisateur trouvé:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur de recherche utilisateur:', error.response?.data || error.message);

      if (error.response && error.response.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }

      throw error;
    }
  }

  async getUserById(userId) {
    try {
      console.log(`Recherche de l'utilisateur avec l'ID: ${userId}`);
  
      const response = await this.dataServiceClient.get(`/users/${userId}`);
  
      console.log('Utilisateur trouvé:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur de recherche utilisateur:', error.response?.data || error.message);
  
      if (error.response && error.response.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
  
      throw error;
    }
  }

  async createPasswordResetToken(userId, tokenData) {
    try {
      console.log('Création du token de réinitialisation pour l\'utilisateur:', userId);

      const response = await this.dataServiceClient.post(`/users/${userId}/reset-password`, tokenData);

      console.log('Réponse de création de token:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du token de réinitialisation:', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyAccount(email, verificationToken) {
    try {
      const response = await this.dataServiceClient.post('/users/verify-account', {
        email,
        verificationToken
      });

      return response.data;
    } catch (error) {
      console.error('Erreur de vérification de compte:', error.response?.data || error.message);

      if (error.response && error.response.status === 400) {
        throw new Error('Token invalide ou expiré');
      }

      throw error;
    }
  }

  async createVerificationToken(userId, tokenData) {
    try {
      console.log('Création du token de vérification :', {
        userId,
        tokenData
      });

      const response = await this.dataServiceClient.post(`/users/${userId}/verify`, tokenData);

      console.log('Réponse de création de token de vérification:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du token de vérification:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ApiClient();