const EmailService = require("../services/emailService");
const FreeSmsService = require("../services/freeSmsService");
const PushService = require("../services/pushService");
const logger = require("../utils/logger");

const NotificationController = {
  /**
   * Envoie un e-mail en fonction du type spécifié
   * Types supportés : confirm, reset, welcome
   */
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
          return res.status(400).json({ error: "Type d'e-mail inconnu" });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      logger.error("❌ Erreur dans sendEmail :", err.message);
      return res.status(500).json({ error: err.message });
    }
  },

  /**
   * Envoie un SMS via le service Free Mobile
   * Actuellement, gère uniquement le type 'reset' (réinitialisation)
   */
  sendSMS: async (req, res) => {
    logger.info("📨 Requête SMS reçue : " + JSON.stringify(req.body));

    try {
      const { username, apiKey, code, type } = req.body;

      if (!username || !apiKey) {
        return res.status(400).json({
          success: false,
          message: "Identifiants Free Mobile requis",
        });
      }

      if (type === "reset") {
        if (!code) {
          return res.status(400).json({
            success: false,
            message: "Code requis pour la réinitialisation",
          });
        }

        logger.info(
          `🔄 Tentative d'envoi SMS de réinitialisation avec code ${code}`
        );
        await FreeSmsService.sendPasswordResetCode(username, apiKey, code);
        logger.info("✅ SMS envoyé avec succès");
      } else {
        logger.warn("⚠️ Type de SMS non pris en charge pour l’instant :", type);
      }

      return res.status(200).json({
        success: true,
        message: "SMS envoyé avec succès",
      });
    } catch (error) {
      logger.error("❌ Erreur de traitement SMS :", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      return res.status(500).json({
        success: false,
        message: `Erreur d'envoi : ${error.message}`,
      });
    }
  },

  /**
   * Envoie une notification push via Firebase
   */
  sendPush: async (req, res) => {
    const { token, title, body } = req.body;

    try {
      await PushService.sendNotification(token, title, body);
      return res.status(200).json({ success: true });
    } catch (err) {
      logger.error("❌ Erreur dans sendPush :", err.message);
      return res.status(500).json({ error: err.message });
    }
  },
};

module.exports = NotificationController;
