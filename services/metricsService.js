const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;

const register = new Registry();
collectDefaultMetrics({ register });

// Métriques HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Métriques notifications
const notificationsSentTotal = new client.Counter({
  name: 'notifications_sent_total',
  help: 'Nombre total de notifications envoyées',
  labelNames: ['type', 'status'],
  registers: [register],
});

const notificationDeliveryTime = new client.Histogram({
  name: 'notification_delivery_seconds',
  help: 'Temps de livraison des notifications',
  labelNames: ['type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Métriques push spécifiques
const pushTokensActive = new client.Gauge({
  name: 'push_tokens_active_total',
  help: 'Nombre de tokens push actifs',
  registers: [register],
});

// Métriques de santé du service
const serviceHealthStatus = new client.Gauge({
  name: 'service_health_status',
  help: 'État de santé du service (1=healthy, 0=unhealthy)',
  labelNames: ['service_name'],
  registers: [register],
});

// Métriques disponibilité des services externes
const externalServiceHealth = new client.Gauge({
  name: 'external_service_health',
  help: 'État de santé des services externes (1=up, 0=down)',
  labelNames: ['service_name'],
  registers: [register],
});

module.exports = {
  register,
  httpRequestsTotal,
  httpDurationHistogram,
  notificationsSentTotal,
  notificationDeliveryTime,
  pushTokensActive,
  serviceHealthStatus,
  externalServiceHealth,
};