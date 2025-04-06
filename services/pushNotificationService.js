const admin = require('firebase-admin');
const logger = require('../utils/logger');

class PushNotificationService {
  constructor() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          type: process.env.FIREBASE_TYPE,
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI,
          token_uri: process.env.FIREBASE_TOKEN_URI,
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        })
      });
    } catch (error) {
      logger.error('Erreur d\'initialisation Firebase', error);
    }
  }

  async sendPushNotification(firebaseToken, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        token: firebaseToken
      };

      const response = await admin.messaging().send(message);
      
      logger.info('Notification push envoyée avec succès', response);
      return response;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification push', error);
      return null;
    }
  }

  async sendAccountVerificationNotification(firebaseToken) {
    const notification = {
      title: 'Vérification de compte',
      body: 'Veuillez vérifier votre compte pour débloquer toutes les fonctionnalités.'
    };

    return this.sendPushNotification(firebaseToken, notification);
  }

  async sendPasswordResetNotification(firebaseToken) {
    const notification = {
      title: 'Réinitialisation de mot de passe',
      body: 'Une demande de réinitialisation de mot de passe a été effectuée.'
    };

    return this.sendPushNotification(firebaseToken, notification);
  }
}

module.exports = new PushNotificationService();