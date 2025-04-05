const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const dotenv = require('dotenv');

dotenv.config();

// Déterminer quel service d'email utiliser (SMTP ou Mailgun)
const useMailgun = process.env.MAIL_SERVICE === 'mailgun';

let transporter;

if (useMailgun) {
  // Configuration pour Mailgun
  const mailgunAuth = {
    auth: {
      api_key: process.env.MAIL_API_KEY,
      domain: process.env.MAIL_DOMAIN
    }
  };
  
  transporter = nodemailer.createTransport(mailgun(mailgunAuth));
} else {
  // Configuration SMTP standard
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  });
}

// Validation de la configuration
transporter.verify()
  .then(() => console.log('Mail service properly configured'))
  .catch(error => console.error('Mail configuration error:', error));

// Options par défaut pour tous les emails
const defaultMailOptions = {
  from: process.env.MAIL_FROM || 'contact@yourapp.com',
  replyTo: process.env.MAIL_REPLY_TO || process.env.MAIL_FROM || 'contact@yourapp.com'
};

module.exports = {
  transporter,
  defaultMailOptions
};