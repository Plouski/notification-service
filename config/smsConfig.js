const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSConfig {
  constructor() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID, 
          process.env.TWILIO_AUTH_TOKEN
        );
        logger.info('Twilio client initialized successfully');
      } else {
        logger.warn('Missing Twilio credentials');
        this.twilioClient = null;
      }
    } catch (error) {
      logger.error('Error initializing Twilio client', error);
      this.twilioClient = null;
    }
  }

  getClient() {
    return this.twilioClient;
  }

  isConfigured() {
    return !!this.twilioClient;
  }
}

module.exports = new SMSConfig();