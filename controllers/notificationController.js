// controllers/notificationController.js (mis à jour)
const notificationService = require('../services/notificationService');
const ApiClient = require('../utils/apiClient');
const logger = require('../utils/logger');

function isValidPhoneNumber(phoneNumber) {
  // Regex pour valider un numéro de téléphone international
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

class NotificationController {

  //Envoyer le code de vérification
  async sendAccountVerification(req, res) {
    try {
      const { email } = req.body;
  
      console.log('Données reçues pour vérification de compte :', { email });
  
      try {
        // Récupérer l'utilisateur depuis data-service
        const user = await ApiClient.getUserByEmail(email);
  
        console.log('Utilisateur récupéré :', user);
  
        const result = await notificationService.sendAccountVerification(user);
  
        res.status(200).json({
          message: 'Notifications de vérification envoyées',
          channels: {
            email: result.email,
            sms: result.sms,
            push: result.push
          }
        });
      } catch (userError) {
        console.error('Erreur utilisateur :', userError);
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Aucun utilisateur trouvé avec cet email' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      console.error('Erreur complète :', error);
      logger.error('Erreur lors de l\'envoi des notifications de vérification', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi des notifications de vérification',
        error: error.message 
      });
    }
  }

  //Envoyer le code pour reinitialiser le mdp oublié
  async initiatePasswordReset(req, res) {
    try {
      const { email, phoneNumber } = req.body;
  
      console.log('Données reçues :', { email, phoneNumber }); // Ajoutez ce log
  
      try {
        // Récupérer l'utilisateur depuis data-service
        const user = await ApiClient.getUserByEmail(email);
        
        // Ajouter le numéro de téléphone à l'objet utilisateur
        user.phoneNumber = phoneNumber;
  
        console.log('Utilisateur récupéré :', user); // Ajoutez ce log
  
        const result = await notificationService.initiatePasswordReset(user);
  
        res.status(200).json({
          message: 'Notifications de réinitialisation de mot de passe envoyées',
          channels: {
            email: result.email,
            sms: result.sms,
            push: result.push
          }
        });
      } catch (userError) {
        console.error('Erreur utilisateur :', userError); // Ajoutez ce log
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Aucun utilisateur trouvé avec cet email' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      console.error('Erreur complète :', error); // Ajoutez ce log
      logger.error('Erreur lors de l\'initiation de la réinitialisation de mot de passe', error);
      res.status(500).json({ 
        message: 'Échec de l\'initiation de la réinitialisation de mot de passe',
        error: error.message 
      });
    }
  }

  async sendSubscriptionStarted(req, res) {
    try {
      const { userId, subscriptionData } = req.body;

      try {
        const user = await ApiClient.getUserById(userId);
        const result = await notificationService.sendSubscriptionNotification(user, subscriptionData, true);

        res.status(200).json({
          message: 'Notifications de début d\'abonnement envoyées',
          channels: {
            email: result.email,
            sms: result.sms,
            push: result.push
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Utilisateur non trouvé' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi des notifications de début d\'abonnement', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi des notifications de début d\'abonnement',
        error: error.message
      });
    }
  }

  async sendSubscriptionEnded(req, res) {
    try {
      const { userId, subscriptionData } = req.body;

      try {
        const user = await ApiClient.getUserById(userId);
        const result = await notificationService.sendSubscriptionNotification(user, subscriptionData, false);

        res.status(200).json({
          message: 'Notifications de fin d\'abonnement envoyées',
          channels: {
            email: result.email,
            sms: result.sms,
            push: result.push
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Utilisateur non trouvé' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi des notifications de fin d\'abonnement', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi des notifications de fin d\'abonnement',
        error: error.message
      });
    }
  }

  async sendInvoice(req, res) {
    try {
      const { userId, invoiceData } = req.body;

      try {
        const user = await ApiClient.getUserById(userId);
        const result = await notificationService.sendInvoiceNotification(user, invoiceData);

        res.status(200).json({
          message: 'Facture envoyée avec succès',
          channels: {
            email: result.email
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Utilisateur non trouvé' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la facture', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi de la facture',
        error: error.message
      });
    }
  }

  async sendPaymentFailed(req, res) {
    try {
      const { userId, paymentData } = req.body;

      try {
        const user = await ApiClient.getUserById(userId);
        const result = await notificationService.sendPaymentFailedNotification(user, paymentData);

        res.status(200).json({
          message: 'Notification d\'échec de paiement envoyée',
          channels: {
            email: result.email
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Utilisateur non trouvé' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification d\'échec de paiement', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi de la notification d\'échec de paiement',
        error: error.message
      });
    }
  }

  async sendAINotification(req, res) {
    try {
      const { userId, resultData } = req.body;

      try {
        const user = await ApiClient.getUserById(userId);
        const result = await notificationService.sendAIResultNotification(user, resultData);

        res.status(200).json({
          message: 'Notification de résultat IA envoyée',
          channels: {
            push: result.push
          }
        });
      } catch (userError) {
        if (userError.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ 
            message: 'Utilisateur non trouvé' 
          });
        }
        
        throw userError;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification de résultat IA', error);
      res.status(500).json({ 
        message: 'Échec de l\'envoi de la notification de résultat IA',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();