# Service de Notification

Ce service gère l'envoi de notifications par différents canaux (emails, SMS, notifications push) pour l'application.

## Fonctionnalités

- **Envoi d'emails** via SMTP ou Mailgun
  - Emails de confirmation d'inscription
  - Factures
  - Notifications d'abonnement
  - Alertes de paiement

- **Envoi de SMS** via Twilio
  - Codes OTP pour réinitialisation de mot de passe
  - Alertes de sécurité

- **Notifications Push** via Firebase Cloud Messaging
  - Notifications d'application
  - Notifications de résultats IA
  - Alertes d'abonnement

## Configuration

1. Installez les dépendances:
   ```
   npm install
   ```

2. Configurez les variables d'environnement en créant un fichier `.env` basé sur le modèle `.env.example`.

3. Démarrez le service:
   ```
   npm start
   ```

Pour le développement:
   ```
   npm run dev
   ```

## Architecture

```
/notification-service/
│
├── config/                # Configuration des services externes
│   ├── mailConfig.js      # SMTP / Mailgun
│   ├── smsConfig.js       # Twilio
│   ├── firebaseConfig.js  # Firebase Cloud Messaging
│
├── routes/                # Routes d'envoi de notification
│   ├── emailRoutes.js     # /email/confirmation, /email/invoice
│   ├── smsRoutes.js       # /sms/send, /sms/reset-password
│   ├── pushRoutes.js      # /push/send
│
├── controllers/           # Logique métier
│   ├── mailController.js
│   ├── smsController.js
│   ├── pushController.js
│
├── services/              # Abstraction des APIs externes
│   ├── mailService.js     # Envoie d'emails
│   ├── smsService.js      # Envoie de SMS OTP
│   ├── pushService.js     # Envoie de notifications push
│   └── dataService.js     # Communication avec data-service
│
├── templates/             # Modèles d'emails et de SMS
│   ├── emailTemplates/    # HTML et texte : confirmation, facture, etc.
│   └── smsTemplates.js    # Modèles de message SMS
│
├── middlewares/           # Authentification, validation
│   ├── authMiddleware.js
│   ├── validateRequest.js
│   └── rateLimiter.js
│
└── utils/                 # Outils généraux
    ├── logger.js
    └── responseFormatter.js
```

## API Routes

### Email Routes

- `POST /api/email/confirmation` - Envoie un email de confirmation d'inscription
- `POST /api/email/invoice` - Envoie une facture par email
- `POST /api/email/subscription-started` - Notifie le début d'un abonnement
- `POST /api/email/subscription-ended` - Notifie la fin d'un abonnement
- `POST /api/email/payment-failed` - Alerte d'échec de paiement

### SMS Routes

- `POST /api/sms/reset-password` - Envoie un code OTP par SMS
- `POST /api/sms/verify-otp` - Vérifie un code OTP
- `POST /api/sms/send` - Envoie un SMS personnalisé

### Push Notification Routes

- `POST /api/push/send` - Envoie une notification push à un appareil
- `POST /api/push/send-to-topic` - Envoie une notification à un sujet
- `POST /api/push/ai-notification` - Notifie qu'un résultat IA est disponible
- `POST /api/push/subscription-notification` - Envoie une notification concernant l'abonnement

## Intégration

Ce service communique avec le service `data-service` pour:
- Stocker et vérifier les codes OTP
- Enregistrer l'historique des notifications envoyées 
- Récupérer les informations utilisateur

## Sécurité

- Validation des requêtes
- Rate limiting pour éviter les abus
- Authentification JWT pour toutes les routes
- Logs sécurisés (sans données sensibles)