// services/emailService.js (mis à jour)
const mailConfig = require('../config/mailConfig');
const emailTemplates = require('../templates/emailTemplates');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = mailConfig.getTransporter();
  }

  async sendEmail(to, subject, templateName, templateData) {
    try {
      if (!emailTemplates[templateName]) {
        throw new Error(`Template d'email "${templateName}" non trouvé`);
      }

      const template = emailTemplates[templateName];

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: template.html(templateData),
        text: template.text(templateData)
      });

      logger.info(`Email "${templateName}" envoyé à ${to}`);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email "${templateName}"`, {
        error: error.message,
        recipient: to
      });
      return false;
    }
  }

  async sendAccountVerificationEmail(user, verificationToken) {
    const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}`;
    
    return this.sendEmail(
      user.email,
      'Confirmez votre compte',
      'accountVerification',
      {
        firstName: user.firstName || 'Utilisateur',
        confirmationLink: confirmationLink
      }
    );
  }

  async sendVerificationEmail(user, verificationToken) {
    try {
      const verificationLink = `${process.env.FRONTEND_URL}/verify-account?token=${verificationToken}`;
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Vérifiez votre compte',
        html: `
          <h1>Vérification de compte</h1>
          <p>Bonjour ${user.firstName},</p>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
          <a href="${verificationLink}">Vérifier mon compte</a>
          <p>Ce lien expire dans 24 heures.</p>
        `
      });
  
      logger.info(`Email de vérification envoyé à ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de vérification', error);
      return false;
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    return this.sendEmail(
      user.email,
      'Réinitialisation de mot de passe',
      'passwordReset',
      {
        firstName: user.firstName || 'Utilisateur',
        resetCode: resetToken
      }
    );
  }

  async sendInvoiceEmail(user, invoiceData) {
    return this.sendEmail(
      user.email,
      `Facture ${invoiceData.invoiceNumber}`,
      'invoice',
      {
        firstName: user.firstName || 'Utilisateur',
        ...invoiceData
      }
    );
  }

  async sendSubscriptionStartedEmail(user, subscriptionData) {
    return this.sendEmail(
      user.email,
      'Confirmation d\'abonnement',
      'subscriptionStarted',
      {
        firstName: user.firstName || 'Utilisateur',
        ...subscriptionData
      }
    );
  }

  async sendSubscriptionEndedEmail(user, subscriptionData) {
    const resubscribeLink = `${process.env.FRONTEND_URL}/subscriptions`;
    
    return this.sendEmail(
      user.email,
      'Fin d\'abonnement',
      'subscriptionEnded',
      {
        firstName: user.firstName || 'Utilisateur',
        resubscribeLink,
        ...subscriptionData
      }
    );
  }

  async sendPaymentFailedEmail(user, paymentData) {
    const updatePaymentLink = `${process.env.FRONTEND_URL}/payment-methods`;
    
    return this.sendEmail(
      user.email,
      'Échec de paiement',
      'paymentFailed',
      {
        firstName: user.firstName || 'Utilisateur',
        updatePaymentLink,
        ...paymentData
      }
    );
  }
}

module.exports = new EmailService();