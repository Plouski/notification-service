const EmailService = require("../services/emailService");
const FreeSmsService = require("../services/freeSmsService");
const PushService = require("../services/pushService");

const NotificationController = {
  sendEmail: async (req, res) => {
    const { type, email, tokenOrCode } = req.body;

    try {
      switch (type) {
        case "confirm":
          await EmailService.sendConfirmationEmail(email, tokenOrCode);
          break;
        case "reset":
          await EmailService.sendPasswordResetEmail(email, tokenOrCode);
          break;
        case "welcome":
          await EmailService.sendWelcomeEmail(email, tokenOrCode);
          break;
        default:
          return res.status(400).json({ error: "Type d'email inconnu" });
      }

      return res.status(200).json({ success: true });

    } catch (err) {
      console.error("❌ Erreur dans sendEmail:", err.message);
      return res.status(500).json({ error: err.message });
    }
  },

  sendSMS: async (req, res) => {
    console.log('📨 Requête SMS reçue:', JSON.stringify(req.body));
    
    try {
      const { username, apiKey, code, type } = req.body;
      
      if (!username || !apiKey) {
        return res.status(400).json({
          success: false,
          message: 'Identifiants Free Mobile requis'
        });
      }
      
      if (type === 'reset') {
        if (!code) {
          return res.status(400).json({
            success: false,
            message: 'Code requis pour reset'
          });
        }
        
        console.log(`🔄 Tentative d'envoi SMS de réinitialisation avec code ${code}`);
        await FreeSmsService.sendPasswordResetCode(username, apiKey, code);
        console.log('✅ SMS envoyé avec succès');
      } else {
        // Autres types de SMS...
      }
      
      return res.status(200).json({
        success: true,
        message: 'SMS envoyé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur de traitement SMS:', error.message);
      return res.status(500).json({
        success: false,
        message: `Erreur d'envoi: ${error.message}`
      });
    }
  },

  sendPush: async (req, res) => {
    const { token, title, body } = req.body;

    try {
      await PushService.sendNotification(token, title, body);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Erreur dans sendPush:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
};

module.exports = NotificationController;