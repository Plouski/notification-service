// Mise à jour du service SMS avec meilleure gestion des erreurs et logs
const twilio = require("twilio");

const SmsService = {
  sendPasswordResetCode: async (phoneNumber, code) => {
    try {
      // Amélioration du formatage du numéro au format international E.164
      let formattedPhone = phoneNumber;

      // Si le numéro commence par 0, le remplacer par +33 (format français)
      if (phoneNumber.startsWith('0')) {
        formattedPhone = '+33' + phoneNumber.substring(1);
      } 
      // Si le numéro ne commence pas par +, l'ajouter
      else if (!phoneNumber.startsWith('+')) {
        formattedPhone = '+' + phoneNumber;
      }

      // Log détaillé pour le debugging
      console.log("🔍 Configuration Twilio:", { 
        sid: process.env.TWILIO_SID ? "Défini" : "Non défini", 
        auth: process.env.TWILIO_AUTH ? "Défini" : "Non défini",
        from: process.env.TWILIO_PHONE,
        to: formattedPhone
      });

      // Vérification que les variables d'environnement nécessaires sont définies
      if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_PHONE) {
        throw new Error("Configuration Twilio incomplète: vérifiez SID, AUTH et PHONE");
      }

      // Initialisation du client Twilio avec gestion d'erreur explicite
      let client;
      try {
        client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
        console.log("✅ Client Twilio initialisé");
      } catch (initError) {
        console.error("❌ Erreur d'initialisation du client Twilio:", initError);
        throw new Error(`Échec d'initialisation Twilio: ${initError.message}`);
      }

      // Tentative d'envoi du SMS avec log complet de la réponse
      console.log("📤 Tentative d'envoi SMS via Twilio");
      const result = await client.messages.create({
        body: `Code de réinitialisation RoadTrip: ${code}`,
        from: process.env.TWILIO_PHONE,
        to: formattedPhone
      });

      // Log détaillé du résultat pour vérifier le statut
      console.log("📨 Réponse Twilio:", {
        sid: result.sid,
        status: result.status,
        dateCreated: result.dateCreated,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      });
      
      return result;
    } catch (error) {
      // Gestion d'erreur améliorée pour identifier la source du problème
      console.error("❌ Erreur d'envoi SMS détaillée:", {
        message: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  },

  // Méthode générique pour envoyer différents types de SMS
  sendSMS: async (phoneNumber, message, type = "general") => {
    // Réutiliser la même logique que sendPasswordResetCode pour la cohérence
    try {
      // Normalisation du numéro de téléphone
      let formattedPhone = phoneNumber;
      if (phoneNumber.startsWith('0')) {
        formattedPhone = '+33' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+')) {
        formattedPhone = '+' + phoneNumber;
      }

      if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_PHONE) {
        throw new Error("Configuration Twilio incomplète");
      }

      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: formattedPhone
      });
      
      console.log(`SMS de type ${type} envoyé avec succès:`, {
        to: formattedPhone,
        status: result.status,
        sid: result.sid
      });
      
      return result;
    } catch (error) {
      console.error(`Erreur d'envoi de SMS de type ${type}:`, {
        to: phoneNumber,
        message: error.message,
        code: error.code
      });
      throw error;
    }
  }
};

module.exports = SmsService;