const admin = require('firebase-admin');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// Récupérer les variables d'environnement pour Firebase
const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Variable pour indiquer si Firebase est correctement configuré
let firebaseInitialized = false;

// Créer un objet de service de messagerie factice pour éviter les erreurs
const mockMessaging = {
  send: async () => {
    logger.warn('Firebase messaging is disabled: Invalid configuration');
    return 'mock-message-id';
  },
  subscribeToTopic: async () => {
    logger.warn('Firebase topic subscription is disabled: Invalid configuration');
    return { successCount: 0, failureCount: 0 };
  },
  unsubscribeFromTopic: async () => {
    logger.warn('Firebase topic unsubscription is disabled: Invalid configuration');
    return { successCount: 0, failureCount: 0 };
  }
};

// Essayer d'initialiser Firebase Admin SDK
try {
  // Vérifier que les informations d'identification sont présentes
  if (!projectId || !privateKey || !clientEmail) {
    throw new Error('Missing Firebase credentials in environment variables');
  }
  
  // Initialiser Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail
    }),
  });
  
  firebaseInitialized = true;
  logger.info('Firebase service properly configured');
} catch (error) {
  firebaseInitialized = false;
  logger.error('Firebase initialization error:', error);
  logger.warn('Firebase services will be mocked. Push notifications will not be sent.');
}

// Exporter admin et le service de messagerie approprié
module.exports = {
  admin,
  messaging: firebaseInitialized ? admin.messaging() : mockMessaging,
  isInitialized: firebaseInitialized
};