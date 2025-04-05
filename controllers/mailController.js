const mailService = require('../services/mailService');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Contrôleur pour la gestion des emails
 */
const mailController = {
  /**
   * Envoie un email de confirmation après inscription
   */
  async sendConfirmationEmail(req, res) {
    try {
      const { userId, email, username, confirmationToken } = req.body;
      
      // Génération de l'URL de confirmation
      const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${confirmationToken}&userId=${userId}`;
      
      // Envoi de l'email via le service
      const result = await mailService.sendEmail({
        to: email,
        subject: 'Confirmez votre adresse email',
        templateName: 'email-confirmation',
        templateData: {
          username: username || 'utilisateur',
          confirmationUrl
        },
        metadata: {
          userId,
          type: 'email-confirmation'
        }
      });
      
      logger.info(`Confirmation email sent to ${email} for user ${userId}`);
      return formatResponse(res, 200, 'Email de confirmation envoyé avec succès', result);
    } catch (error) {
      logger.error(`Failed to send confirmation email: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de l\'email de confirmation', null, error);
    }
  },

  /**
   * Envoie une facture par email
   */
  async sendInvoiceEmail(req, res) {
    try {
      const { userId, email, invoiceId, amount, date, items } = req.body;
      
      // Préparation des données pour le template
      const templateData = {
        invoiceId,
        amount,
        date: new Date(date).toLocaleDateString('fr-FR'),
        items,
        downloadUrl: `${process.env.FRONTEND_URL}/invoices/${invoiceId}/download`
      };
      
      // Envoi de l'email via le service
      const result = await mailService.sendEmail({
        to: email,
        subject: `Facture #${invoiceId}`,
        templateName: 'invoice',
        templateData,
        metadata: {
          userId,
          type: 'invoice',
          invoiceId
        },
        attachments: [{
          filename: `facture-${invoiceId}.pdf`,
          path: `${process.env.INVOICE_PATH}/${invoiceId}.pdf`
        }]
      });
      
      logger.info(`Invoice email sent to ${email} for user ${userId}, invoice ${invoiceId}`);
      return formatResponse(res, 200, 'Facture envoyée avec succès', result);
    } catch (error) {
      logger.error(`Failed to send invoice email: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de la facture', null, error);
    }
  },

  /**
   * Envoie une notification de début d'abonnement
   */
  async sendSubscriptionStartedEmail(req, res) {
    try {
      const { userId, email, planName, startDate, endDate, amount } = req.body;
      
      // Envoi de l'email via le service
      const result = await mailService.sendEmail({
        to: email,
        subject: 'Votre abonnement a démarré',
        templateName: 'subscription-started',
        templateData: {
          planName,
          startDate: new Date(startDate).toLocaleDateString('fr-FR'),
          endDate: new Date(endDate).toLocaleDateString('fr-FR'),
          amount
        },
        metadata: {
          userId,
          type: 'subscription-started'
        }
      });
      
      logger.info(`Subscription started email sent to ${email} for user ${userId}, plan ${planName}`);
      return formatResponse(res, 200, 'Email de début d\'abonnement envoyé avec succès', result);
    } catch (error) {
      logger.error(`Failed to send subscription started email: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de l\'email de début d\'abonnement', null, error);
    }
  },

  /**
   * Envoie une notification de fin d'abonnement
   */
  async sendSubscriptionEndedEmail(req, res) {
    try {
      const { userId, email, planName, endDate } = req.body;
      
      // Envoi de l'email via le service
      const result = await mailService.sendEmail({
        to: email,
        subject: 'Votre abonnement est arrivé à échéance',
        templateName: 'subscription-ended',
        templateData: {
          planName,
          endDate: new Date(endDate).toLocaleDateString('fr-FR'),
          renewUrl: `${process.env.FRONTEND_URL}/subscription/renew`
        },
        metadata: {
          userId,
          type: 'subscription-ended'
        }
      });
      
      logger.info(`Subscription ended email sent to ${email} for user ${userId}, plan ${planName}`);
      return formatResponse(res, 200, 'Email de fin d\'abonnement envoyé avec succès', result);
    } catch (error) {
      logger.error(`Failed to send subscription ended email: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de l\'email de fin d\'abonnement', null, error);
    }
  },

  /**
   * Envoie une notification d'échec de paiement
   */
  async sendPaymentFailedEmail(req, res) {
    try {
      const { userId, email, amount, reason, nextAttempt } = req.body;
      
      // Envoi de l'email via le service
      const result = await mailService.sendEmail({
        to: email,
        subject: 'Échec de paiement',
        templateName: 'payment-failed',
        templateData: {
          amount,
          reason: reason || 'Une erreur est survenue lors du traitement de votre paiement',
          nextAttempt: nextAttempt ? new Date(nextAttempt).toLocaleDateString('fr-FR') : 'bientôt',
          updatePaymentUrl: `${process.env.FRONTEND_URL}/payment/update`
        },
        metadata: {
          userId,
          type: 'payment-failed'
        }
      });
      
      logger.info(`Payment failed email sent to ${email} for user ${userId}`);
      return formatResponse(res, 200, 'Email d\'échec de paiement envoyé avec succès', result);
    } catch (error) {
      logger.error(`Failed to send payment failed email: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de l\'email d\'échec de paiement', null, error);
    }
  },

  /**
   * Envoie un email personnalisé
   */
  async sendCustomEmail(req, res) {
    try {
      const { userId, email, subject, templateName, templateData } = req.body;
      
      // Vérification que le template existe
      if (!mailService.templateExists(templateName)) {
        return formatResponse(res, 400, `Le template ${templateName} n'existe pas`);
      }
      
      // Envoi de l'email via le service
      const result = await mailService.sendEmail({
        to: email,
        subject,
        templateName,
        templateData,
        metadata: {
          userId,
          type: 'custom',
          templateName
        }
      });
      
      logger.info(`Custom email (${templateName}) sent to ${email} for user ${userId}`);
      return formatResponse(res, 200, 'Email personnalisé envoyé avec succès', result);
    } catch (error) {
      logger.error(`Failed to send custom email: ${error.message}`);
      return formatResponse(res, 500, 'Échec de l\'envoi de l\'email personnalisé', null, error);
    }
  }
};

module.exports = mailController;