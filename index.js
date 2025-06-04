// ───────────── Importations ─────────────
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const notificationRoutes = require('./routes/notificationRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const { httpRequestsTotal, httpDurationHistogram } = require('./services/metricsService');
const basicLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
const PORT = process.env.PORT || 5005;

console.log('🔥 Lancement du Notification Service...');

// ───────────── Middlewares globaux ─────────────
app.use(helmet());
app.use(basicLimiter);

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ───────────── Metrics Middleware ─────────────
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const seconds = duration[0] + duration[1] / 1e9;

    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    });

    httpDurationHistogram.observe({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    }, seconds);
  });

  next();
});

// ───────────── Routes ─────────────
app.use('/api/notifications', notificationRoutes);
app.use('/metrics', metricsRoutes);

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ───────────── Gestion d'erreurs Express ─────────────
app.use(errorHandler);

// ───────────── Démarrage serveur ─────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 Notification service démarré sur http://localhost:${PORT}`);
});

// ───────────── Gestion erreurs Node.js (global) ─────────────
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;