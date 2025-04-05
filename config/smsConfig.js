const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

// Configuration Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Vérifier que les informations d'identification sont présentes
if (!accountSid || !authToken || !fromPhoneNumber) {
  console.error('SMS configuration error: Missing Twilio credentials in environment variables');
}

// Initialiser le client Twilio uniquement si les identifiants sont valides
let twilioClient = null;

// Vérifier que le SID commence bien par "AC" (format requis par Twilio)
if (accountSid && accountSid.startsWith('AC') && authToken) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error.message);
  }
} else {
  console.warn('Invalid Twilio credentials. SMS functionality will be disabled.');
  // Créer un client factice pour éviter les erreurs lors de l'appel aux méthodes
  twilioClient = {
    messages: {
      create: async () => {
        console.warn('SMS sending disabled: No valid Twilio credentials');
        return { sid: 'FAKE_SID_NO_CREDENTIALS', status: 'disabled' };
      }
    },
    fetch: async () => {
      console.warn('SMS status check disabled: No valid Twilio credentials');
      return { status: 'disabled' };
    }
  };
}

// Configuration SMS par défaut
const defaultSmsOptions = {
  from: fromPhoneNumber || '+15005550006', // Utiliser un numéro de test Twilio si non défini
  // Paramètres supplémentaires comme région par défaut, etc.
};

module.exports = {
  twilioClient,
  defaultSmsOptions
};