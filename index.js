require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const dataService = require("./services/dataService");
const logger = require("./utils/logger");
const {
  httpRequestsTotal,
  httpDurationHistogram,
  serviceHealthStatus,
  externalServiceHealth,
} = require("./services/metricsService");
const basicLimiter = require("./middlewares/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5005;

console.log("🔥 Lancement du Notification Service...");

(async () => {
  try {
    // ───────────── Vérification des services dépendants ─────────────
    logger.info("🔍 Vérification de la connexion au data-service...");
    try {
      await dataService.getUserById("health-check");
      logger.info("✅ Data-service disponible");
    } catch (error) {
      if (error.response?.status === 404) {
        logger.info(
          "✅ Data-service disponible (test user non trouvé = normal)"
        );
      } else {
        logger.error("❌ Data-service indisponible:", error.message);
        logger.warn(
          "⚠️ Démarrage en mode dégradé - certaines fonctionnalités peuvent être limitées"
        );
      }
    }

    // ───────────── Middlewares globaux ─────────────
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://fcm.googleapis.com"],
          },
        },
      })
    );

    app.use(basicLimiter);

    const corsOptions = {
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "x-api-key"],
      credentials: true,
      optionsSuccessStatus: 200,
    };

    app.use(cors(corsOptions));
    app.use(express.json({ limit: "1mb", strict: true }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));

    // ───────────── Middleware de monitoring temps de réponse ─────────────
    app.use((req, res, next) => {
      const start = process.hrtime();

      res.on("finish", () => {
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;

        // Mesurer le temps de réponse
        httpDurationHistogram.observe(
          {
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode,
          },
          seconds
        );

        // Compter les requêtes
        httpRequestsTotal.inc({
          method: req.method,
          route: req.route ? req.route.path : req.path,
          status_code: res.statusCode,
        });
      });

      next();
    });

    // ───────────── Middleware de logging ─────────────
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info(
          `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
        );
      });
      next();
    });

    // ───────────── Routes ─────────────
    app.use("/api/notifications", notificationRoutes);
    app.use("/metrics", metricsRoutes);

    // ───────────── Route de santé avec métriques ─────────────
    app.get("/health", async (req, res) => {
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {},
      };

      try {
        await dataService.getUserById("health-check-test");
        health.services.dataService = "healthy";
        externalServiceHealth.set({ service_name: "data-service" }, 1);
      } catch (error) {
        if (error.response?.status === 404) {
          health.services.dataService = "healthy";
          externalServiceHealth.set({ service_name: "data-service" }, 1);
        } else {
          health.services.dataService = "unhealthy";
          health.status = "degraded";
          externalServiceHealth.set({ service_name: "data-service" }, 0);
          logger.warn(`⚠️ Data-service unhealthy: ${error.message}`);
        }
      }

      try {
        const messaging = require("./config/firebase-admin");
        if (messaging) {
          health.services.firebase = "healthy";
          externalServiceHealth.set({ service_name: "firebase" }, 1);
        } else {
          throw new Error("Firebase messaging not initialized");
        }
      } catch (error) {
        health.services.firebase = "unhealthy";
        health.status = "degraded";
        externalServiceHealth.set({ service_name: "firebase" }, 0);
        logger.warn(`⚠️ Firebase unhealthy: ${error.message}`);
      }

      try {
        const transporter = require("./utils/transporter");
        if (transporter && process.env.MAILJET_API_KEY) {
          health.services.email = "healthy";
          externalServiceHealth.set({ service_name: "mailjet" }, 1);
        } else {
          throw new Error("Email transporter not configured");
        }
      } catch (error) {
        health.services.email = "unhealthy";
        health.status = "degraded";
        externalServiceHealth.set({ service_name: "mailjet" }, 0);
        logger.warn(`⚠️ Email service unhealthy: ${error.message}`);
      }

      const isHealthy = health.status === "healthy" ? 1 : 0;
      serviceHealthStatus.set(
        { service_name: "notification-service" },
        isHealthy
      );

      const statusCode = health.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(health);
    });

    app.get("/ping", (req, res) => {
      res.status(200).json({
        status: "pong ✅",
        timestamp: new Date().toISOString(),
        service: "notification-service",
        uptime: process.uptime(),
      });
    });

    // ───────────── Gestion 404 ─────────────
    app.use((req, res) => {
      logger.warn("📍 Route non trouvée", {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(404).json({
        error: "Route non trouvée",
        message: `La route ${req.method} ${req.path} n'existe pas`,
        availableRoutes: [
          "GET /health",
          "GET /ping",
          "POST /api/notifications/email",
          "POST /api/notifications/sms",
          "POST /api/notifications/push/token",
          "POST /api/notifications/push/send",
          "GET /metrics",
        ],
        timestamp: new Date().toISOString(),
      });
    });

    // ───────────── Gestion d'erreurs globales ─────────────
    app.use((err, req, res) => {
      logger.error("💥 Erreur Express:", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
      });

      // Erreurs spécifiques notifications
      if (err.name === "ValidationError") {
        return res.status(400).json({
          error: "Erreur de validation",
          message: err.message,
          details: err.errors,
          timestamp: new Date().toISOString(),
        });
      }

      // Erreurs de rate limiting
      if (err.status === 429) {
        return res.status(429).json({
          error: "Trop de requêtes",
          message: "Limite de taux dépassée, veuillez réessayer plus tard",
          timestamp: new Date().toISOString(),
        });
      }

      // Erreurs Firebase
      if (err.code && err.code.startsWith("messaging/")) {
        return res.status(400).json({
          error: "Erreur Firebase",
          message: "Erreur lors de l'envoi de la notification push",
          code: err.code,
          timestamp: new Date().toISOString(),
        });
      }

      // Erreurs de connexion aux services externes
      if (
        err.message &&
        (err.message.includes("data-service") ||
          err.message.includes("ECONNREFUSED"))
      ) {
        return res.status(503).json({
          error: "Service temporairement indisponible",
          message: "Un service externe est actuellement indisponible",
          timestamp: new Date().toISOString(),
        });
      }

      const statusCode = err.statusCode || err.status || 500;
      const message =
        process.env.NODE_ENV === "production" && statusCode === 500
          ? "Erreur serveur interne"
          : err.message || "Une erreur est survenue";

      res.status(statusCode).json({
        error: "Erreur serveur",
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
      });
    });

    // ───────────── Démarrage du serveur ─────────────
    app.listen(PORT, () => {
      logger.info(
        `🚀 Notification service démarré sur http://localhost:${PORT}`
      );
      logger.info(`🔐 Environnement: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `🌐 CORS autorisé pour: ${
          process.env.CORS_ORIGIN || "http://localhost:3000"
        }`
      );
      logger.info(
        `📊 Métriques disponibles sur: http://localhost:${PORT}/metrics`
      );
      logger.info(
        `❤️ Health check disponible sur: http://localhost:${PORT}/health`
      );
      logger.info(
        `🔔 API Notifications disponible sur: http://localhost:${PORT}/api/notifications`
      );
    });

  } catch (err) {
    console.error("❌ Erreur fatale au démarrage :", err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();

module.exports = app;