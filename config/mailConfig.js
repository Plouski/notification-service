const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const logger = require('../utils/logger');

class MailConfig {
  constructor() {
    // Configuration SMTP par défaut
    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Configuration Mailgun (alternative)
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      this.mailgunTransporter = nodemailer.createTransport(mailgunTransport({
        auth: {
          api_key: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN
        }
      }));
    }
  }

  getTransporter() {
    // Utiliser Mailgun si disponible, sinon SMTP
    return this.mailgunTransporter || this.smtpTransporter;
  }
}

module.exports = new MailConfig();