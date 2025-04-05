const fs = require('fs');
const path = require('path');
const { transporter, defaultMailOptions, mailConfigured } = require('../config/mailConfig');
const logger = require('../utils/logger');
const handlebars = require('handlebars');

/**
 * Service pour l'envoi d'emails
 */
const mailService = {
  /**
   * Envoyer un email
   * @param {Object} options - Les options de l'email
   * @param {string} options.to - Destinataire
   * @param {string} options.subject - Sujet de l'email
   * @param {string} options.templateName - Nom du template à utiliser
   * @param {Object} options.templateData - Données pour le template
   * @param {Object} options.metadata - Métadonnées pour le suivi
   * @param {Array} options.attachments - Fichiers à joindre
   * @returns {Promise} Promesse résolue avec le résultat de l'envoi
   */
  async sendEmail(options) {
    try {
      // Préparation du contenu de l'email depuis le template
      const { html, text } = await this.prepareEmailContent(options.templateName, options.templateData);

      // Configuration de l'email
      const mailOptions = {
        ...defaultMailOptions,
        to: options.to,
        subject: options.subject,
        html,
        text,
        attachments: options.attachments || []
      };

      // Envoi de l'email
      const result = await transporter.sendMail(mailOptions);

      // Enregistrer l'envoi dans la base de données pour le suivi
      await this.logEmailSent(result.messageId, options.to, options.subject, options.metadata);
      
      logger.info(`Email sent: ${result.messageId} to ${options.to}`);
      return {
        messageId: result.messageId,
        envelope: result.envelope,
        accepted: result.accepted,
        rejected: result.rejected
      };
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Préparer le contenu HTML et texte d'un email à partir d'un template
   * @param {string} templateName - Nom du template
   * @param {Object} data - Données pour le template
   * @returns {Object} Contenu HTML et texte de l'email
   */
  async prepareEmailContent(templateName, data) {
    try {
      // Chemin du template
      const htmlPath = path.join(__dirname, '../templates/emailTemplates', `${templateName}.html`);
      const textPath = path.join(__dirname, '../templates/emailTemplates', `${templateName}.txt`);

      // Vérifier si les fichiers de template existent
      const htmlExists = fs.existsSync(htmlPath);
      const textExists = fs.existsSync(textPath);

      // Charger et compiler les templates
      let html = '';
      let text = '';

      if (htmlExists) {
        const htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
        const htmlCompiler = handlebars.compile(htmlTemplate);
        html = htmlCompiler(data);
      }

      if (textExists) {
        const textTemplate = fs.readFileSync(textPath, 'utf8');
        const textCompiler = handlebars.compile(textTemplate);
        text = textCompiler(data);
      } else if (htmlExists) {
        // Créer une version texte à partir du HTML si le fichier texte n'existe pas
        text = this.htmlToText(html);
      }

      return { html, text };
    } catch (error) {
      logger.error(`Error preparing email content: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Vérifier si un template existe
   * @param {string} templateName - Nom du template à vérifier
   * @returns {boolean} True si le template existe
   */
  templateExists(templateName) {
    const htmlPath = path.join(__dirname, '../templates/emailTemplates', `${templateName}.html`);
    return fs.existsSync(htmlPath);
  },

  /**
   * Enregistrer l'envoi d'un email dans la base de données
   * @param {string} messageId - ID du message
   * @param {string} recipient - Destinataire
   * @param {string} subject - Sujet de l'email
   * @param {Object} metadata - Métadonnées
   */
  async logEmailSent(messageId, recipient, subject, metadata = {}) {
    try {
      // Importer le service de données
      const dataService = require('./dataService');
      
      // Enregistrer l'envoi
      await dataService.logNotification({
        channel: 'email',
        messageId,
        recipient,
        subject,
        status: 'sent',
        metadata
      });
    } catch (error) {
      logger.error(`Error logging email: ${error.message}`);
      // Ne pas bloquer l'envoi si l'enregistrement échoue
    }
  },

  /**
   * Convertir un contenu HTML en texte simple
   * @param {string} html - Contenu HTML
   * @returns {string} Contenu texte
   */
  htmlToText(html) {
    // Version très simple, à améliorer avec une bibliothèque comme html-to-text
    return html
      .replace(/<[^>]*>/g, ' ') // Supprimer les balises HTML
      .replace(/\s+/g, ' ')     // Remplacer les espaces multiples par un espace
      .trim();
  }
};

module.exports = mailService;