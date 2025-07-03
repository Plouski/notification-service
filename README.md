# 🔔 Notification Service - ROADTRIP!

## 📋 Description

Service de notifications multi-canal permettant l'envoi d'emails, SMS et notifications push aux utilisateurs de la plateforme ROADTRIP!. Ce microservice gère la communication avec les utilisateurs pour la confirmation de comptes, la réinitialisation de mots de passe et les notifications en temps réel.

## ⚡ Fonctionnalités

### 📧 **Notifications Email**
- **Confirmation de compte** : Email avec lien de validation
- **Réinitialisation mot de passe** : Email avec code de sécurité
- **Bienvenue** : Email d'accueil personnalisé
- Templates HTML professionnels et responsives

### 📱 **Notifications SMS**
- **Free Mobile API** : SMS gratuits pour les abonnés Free
- **Twilio** : SMS premium avec couverture internationale
- Codes de réinitialisation sécurisés

### 🔔 **Notifications Push**
- **Firebase Cloud Messaging** : Notifications temps réel
- Gestion des tokens utilisateurs
- Validation et tracking des deliveries

### 📊 **Monitoring & Observabilité**
- Métriques Prometheus intégrées
- Health checks automatiques
- Logs structurés avec Winston
- Suivi des performances en temps réel

## 🏗️ Architecture

```
notification-service/
├── 📁 config/                 # Configuration Firebase
├── 📁 controllers/            # Logique métier
├── 📁 middlewares/            # Rate limiting, auth, erreurs
├── 📁 routes/                 # Routes API
├── 📁 services/               # Services externes (email, SMS, push)
├── 📁 templates/              # Templates HTML emails
├── 📁 utils/                  # Utilitaires (logger, transporter)
├── 📄 index.js                # Point d'entrée
├── 📄 package.json
└── 📄 Dockerfile
```

## 🚀 Installation & Démarrage

### **Prérequis**
- Node.js 20+
- NPM ou Yarn
- Comptes configurés : Mailjet, Firebase, Free Mobile (optionnel), Twilio (optionnel)

### **Installation**
```bash
# Cloner le projet
git clone <repository-url>
cd notification-service

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API
```

### **Configuration (.env)**
```bash
# Serveur
PORT=5005
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# API Keys
NOTIFICATION_API_KEY=your_secret_api_key_here

# Data Service
DATA_SERVICE_URL=http://localhost:5002

# Email (Mailjet)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_secret
EMAIL_FROM_NAME=ROADTRIP Team
EMAIL_FROM_ADDRESS=noreply@roadtrip.fr
FRONTEND_URL=http://localhost:3000

# Firebase Push Notifications
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# SMS (optionnels)
FREE_MOBILE_USER=your_free_mobile_id
FREE_MOBILE_API_KEY=your_free_api_key
TWILIO_SID=your_twilio_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=+33123456789
```

### **Démarrage**
```bash
# Mode développement
npm run dev

# Mode production
npm start

# Avec Docker
docker build -t notification-service .
docker run -p 5005:5005 --env-file .env notification-service
```

## 📖 API Documentation

### **🔓 Endpoints Publics**

#### **GET /health**
Vérification de l'état du service et de ses dépendances.

**Réponse :**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-04T13:08:22.850Z",
  "uptime": 54.4233596,
  "services": {
    "dataService": "healthy",
    "firebase": "healthy",
    "email": "healthy"
  }
}
```

#### **GET /ping**
Test rapide de disponibilité du service.

#### **GET /metrics**
Métriques Prometheus pour monitoring.

### **📧 Notifications Email**

#### **POST /api/notifications/email**
Envoi d'emails selon le type spécifié.

**Body :**
```json
{
  "type": "confirm|reset|welcome",
  "email": "user@example.com",
  "tokenOrCode": "abc123" // Token pour confirm, code pour reset, prénom pour welcome
}
```

**Types disponibles :**
- `confirm` : Email de confirmation avec lien
- `reset` : Email de réinitialisation avec code
- `welcome` : Email de bienvenue

### **📱 Notifications SMS**

#### **POST /api/notifications/sms**
Envoi de SMS via Free Mobile API.

**Body :**
```json
{
  "username": "12345678",
  "apiKey": "your_free_api_key",
  "code": "123456",
  "type": "reset"
}
```

### **🔔 Notifications Push** 🔒

> **Note :** Endpoints protégés par API Key (`x-api-key` header requis)

#### **POST /api/notifications/push/token**
Enregistrement d'un token push pour un utilisateur.

**Headers :**
```
x-api-key: your_secret_api_key
```

**Body :**
```json
{
  "userId": "user123",
  "token": "firebase_fcm_token"
}
```

#### **POST /api/notifications/push/send**
Envoi d'une notification push à un utilisateur.

**Headers :**
```
x-api-key: your_secret_api_key
```

**Body :**
```json
{
  "userId": "user123",
  "title": "🚗 Nouveau voyage disponible !",
  "body": "Un road trip incroyable vous attend...",
  "data": {
    "action": "open_trip",
    "tripId": "trip456"
  }
}
```

## 📊 Monitoring

### **Métriques disponibles**

- `http_requests_total` : Nombre total de requêtes HTTP
- `http_request_duration_seconds` : Temps de réponse des requêtes
- `notifications_sent_total` : Notifications envoyées par type/statut
- `notification_delivery_seconds` : Temps de livraison des notifications
- `service_health_status` : État de santé du service
- `external_service_health` : État des services externes

### **Configuration Prometheus**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'notification-service'
    static_configs:
      - targets: ['localhost:5005']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## 🧪 Tests

### **Tests unitaires**
```bash
npm test
```

### **Tests avec Postman**
Collection disponible : `notification-service.postman_collection.json`

**Endpoints de test :**
1. Health check
2. Email de bienvenue
3. SMS de test
4. Push notification (avec/sans auth)
5. Vérification métriques

### **Tests manuels**
```bash
# Test health check
curl http://localhost:5005/health

# Test ping
curl http://localhost:5005/ping

# Test métriques
curl http://localhost:5005/metrics

# Test email
curl -X POST http://localhost:5005/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","email":"test@example.com","tokenOrCode":"John"}'
```

## 🔧 Scripts NPM

```bash
npm start          # Démarrage production
npm run dev        # Démarrage développement avec nodemon
npm test           # Tests unitaires avec Jest
npm run lint       # Vérification code avec ESLint
npm run lint:fix   # Correction automatique ESLint
```

## 🐳 Docker

### **Build et run**
```bash
# Build de l'image
docker build -t notification-service .

# Run du conteneur
docker run -p 5005:5005 --env-file .env notification-service

# Health check
docker run --rm notification-service npm run health:check
```

### **Docker Compose**
```yaml
services:
  notification-service:
    build: ./notification-service
    ports:
      - "5005:5005"
    environment:
      - NODE_ENV=production
    depends_on:
      - prometheus
      - grafana
```

## 🔒 Sécurité

### **Mesures implémentées**
- **Rate Limiting** : 100 req/15min par IP
- **CORS** : Origines configurables
- **Helmet** : Headers de sécurité
- **API Keys** : Protection endpoints sensibles
- **Validation** : Données d'entrée validées
- **Logs** : Audit trail complet

### **Variables sensibles**
Toutes les clés API doivent être dans `.env` et **JAMAIS** committées.

## 📈 Performance

### **Optimisations**
- Connexions réutilisées (HTTP keep-alive)
- Timeouts configurés
- Gestion mémoire optimisée
- Logs asynchrones

### **Limites**
- **Rate limiting** : 100 req/15min
- **Payload** : 1MB max
- **Timeout** : 30s max par requête

## 🤝 Intégration

### **Services dépendants**
- **data-service** : Gestion utilisateurs
- **Mailjet** : Envoi emails
- **Firebase** : Notifications push
- **Free Mobile** : SMS gratuits
- **Twilio** : SMS premium

### **Communication**
- REST API synchrone
- Format JSON
- Gestion d'erreurs standardisée
- Retry logic sur pannes temporaires

## 🐛 Troubleshooting

### **Erreurs communes**

**Service unhealthy**
```bash
# Vérifier les services externes
curl http://localhost:5002/health  # data-service
# Vérifier les credentials Firebase/Mailjet
```

**Push notifications échouent**
```bash
# Vérifier token Firebase valide
# Vérifier configuration Firebase
# Consulter logs : tail -f logs/app.log
```

**SMS non reçus**
```bash
# Vérifier credentials Free Mobile
# Tester avec Twilio en fallback
```

## 📞 Support

### **Logs**
- **Console** : Développement
- **Fichier** : `logs/app.log`
- **Niveau** : INFO par défaut

### **Monitoring**
- **Health** : `/health`
- **Métriques** : `/metrics`
- **Uptime** : Inclus dans health check

## 📝 Changelog

### **v1.0.0** (2025-06-04)
- ✅ Notifications email, SMS, push
- ✅ Templates HTML professionnels
- ✅ Monitoring Prometheus
- ✅ Sécurité API keys
- ✅ Health checks complets
- ✅ Documentation complète

## 👥 Équipe

- **Développeur** : [Votre nom]
- **Projet** : ROADTRIP! Microservices
- **Contact** : support@roadtrip.fr

## 📄 Licence

MIT License - Voir LICENSE file pour détails.

---

**🚗 ROADTRIP! - Let's hit the road! ✨**