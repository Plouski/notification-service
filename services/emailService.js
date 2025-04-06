const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendConfirmationEmail(user, confirmationToken) {
    try {
      const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${confirmationToken}`;
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Confirmez votre compte',
        html: `
          <h1>Confirmation de compte</h1>
          <p>Bonjour ${user.firstName},</p>
          <p>Cliquez sur le lien ci-dessous pour confirmer votre compte :</p>
          <a href="${confirmationLink}">Confirmer mon compte</a>
          <p>Ce lien expire dans 24 heures.</p>
        `
      });

      logger.info(`Confirmation email sent to ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Error sending confirmation email', error);
      return false;
    }
  }

  async sendPasswordResetEmail(user, resetCode) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Réinitialisation de mot de passe',
        html: `
          <h1>Réinitialisation de mot de passe</h1>
          <p>Votre code de réinitialisation est : <strong>${resetCode}</strong></p>
          <p>Ce code expire dans 15 minutes.</p>
        `
      });

      logger.info(`Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email', error);
      return false;
    }
  }
}

module.exports = new EmailService();