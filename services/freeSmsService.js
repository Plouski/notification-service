const axios = require('axios');
const { logger } = require('../utils/transporter');

const FreeSmsService = {
  
  /**
   * Envoie un SMS générique via l’API Free Mobile
   */
  sendSMS: async (username, apiKey, message) => {
    logger.log(`📤 Envoi SMS via Free Mobile: username=${username.substring(0, 2)}*****, message="${message}"`);
    
    try {
      if (!username || !apiKey) {
        throw new Error('Identifiants Free Mobile manquants');
      }

      const url = `https://smsapi.free-mobile.fr/sendmsg?user=${username}&pass=${apiKey}&msg=${encodeURIComponent(message)}`;
      
      const response = await axios.get(url);
      logger.log(`✅ Réponse API Free Mobile: ${response.status}`);
      
      return { success: true };

    } catch (error) {
      logger.error('❌ Erreur API Free Mobile:', error.message);
      
      if (error.response) {
        logger.error('  Détails:', error.response.status, error.response.data);
      }

      throw error;
    }
  },

  /**
   * Envoie spécifiquement un SMS contenant un code de réinitialisation de mot de passe
   */
  sendPasswordResetCode: async (username, apiKey, code) => {
    return await FreeSmsService.sendSMS(
      username,
      apiKey,
      `ROADTRIP!: Votre code de réinitialisation est: ${code}`
    );
  }

};

module.exports = FreeSmsService;
