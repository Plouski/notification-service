// templates/smsTemplates.js
const Handlebars = require('handlebars');

// Format des SMS
const templates = {
  // Vérification de compte
  accountVerification: Handlebars.compile(
    "{{appName}}: Votre code de vérification est: {{code}}. Ce code expire dans 10 minutes."
  ),
  
  // Réinitialisation de mot de passe
  passwordReset: Handlebars.compile(
    "{{appName}}: Votre code de réinitialisation de mot de passe est: {{code}}. Ce code expire dans 15 minutes."
  ),
  
  // Double authentification
  twoFactorAuth: Handlebars.compile(
    "{{appName}}: Votre code d'authentification est: {{code}}. Ne le partagez avec personne."
  ),
  
  // Notification de changement de mot de passe
  passwordChanged: Handlebars.compile(
    "{{appName}}: Votre mot de passe a été changé. Si vous n'êtes pas à l'origine de cette action, contactez-nous immédiatement."
  ),
  
  // Notification de connexion inhabituelle
  unusualLogin: Handlebars.compile(
    "{{appName}}: Nous avons détecté une connexion inhabituelle à votre compte depuis {{location}}. Si ce n'était pas vous, sécurisez votre compte."
  ),
  
  // Notification d'abonnement 
  subscriptionStarted: Handlebars.compile(
    "{{appName}}: Votre abonnement {{planName}} est actif! Profitez de toutes les fonctionnalités premium dès maintenant."
  ),
  
  // Notification de fin d'abonnement
  subscriptionEnded: Handlebars.compile(
    "{{appName}}: Votre abonnement {{planName}} a expiré. Renouvelez-le sur notre site pour continuer à profiter des avantages."
  )
};

module.exports = templates;