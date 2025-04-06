const admin = require('firebase-admin');
const logger = require('../utils/logger');

class FirebaseConfig {
  constructor() {
    try {
      if (
        process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_CLIENT_EMAIL
      ) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          })
        });
        this.messaging = admin.messaging();
        logger.info('Firebase Admin SDK initialized successfully');
      } else {
        logger.warn('Missing Firebase credentials');
        this.messaging = null;
      }
    } catch (error) {
      logger.error('Error initializing Firebase Admin SDK', error);
      this.messaging = null;
    }
  }

  getMessaging() {
    return this.messaging;
  }

  isConfigured() {
    return !!this.messaging;
  }
}

module.exports = new FirebaseConfig();