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
      if (error.response && error.response.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      
      console.error('Erreur détaillée:', error.response?.data || error.message);
      logger.error('Erreur lors de la recherche de l\'utilisateur par email', error);
      throw error;
    }
  }

  async updateUserVerificationStatus(userId, status) {
    try {
      const response = await this.dataServiceClient.patch(`/users/${userId}/verification`, { 
        isVerified: status 
      });
      return response.data;
    } catch (error) {
      logger.error('Error updating user verification status', error);
      throw error;
    }
  }

  async createPasswordResetToken(userId, token) {
    try {
      const response = await this.dataServiceClient.post(`/users/${userId}/reset-password`, { 
        resetToken: token 
      });
      return response.data;
    } catch (error) {
      logger.error('Error creating password reset token', error);
      throw error;
    }
  }
}

module.exports = new ApiClient();