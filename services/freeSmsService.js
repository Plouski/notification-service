// notification-service/services/freeSmsService.js
const axios = require('axios');

const FreeSmsService = {
  sendSMS: async (username, apiKey, message) => {
    console.log(`📤 Envoi SMS via Free Mobile: username=${username.substring(0, 2)}*****, message="${message}"`);
    
    try {
      if (!username || !apiKey) {
        throw new Error('Identifiants Free Mobile manquants');
      }
      
      const url = `https://smsapi.free-mobile.fr/sendmsg?user=${username}&pass=${apiKey}&msg=${encodeURIComponent(message)}`;
      
      const response = await axios.get(url);
      console.log(`✅ Réponse API Free Mobile: ${response.status}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur API Free Mobile:', error.message);
      if (error.response) {
        console.error('  Détails:', error.response.status, error.response.data);
      }
      throw error;
    }
  },
  
  sendPasswordResetCode: async (username, apiKey, code) => {
    return await FreeSmsService.sendSMS(
      username, 
      apiKey, 
      `ROADTRIP!: Votre code de réinitialisation est: ${code}`
    );
  }
};

module.exports = FreeSmsService;