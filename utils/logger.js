const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Créer le répertoire de logs s'il n'existe pas
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Ajouter les métadonnées s'il y en a
    if (Object.keys(metadata).length > 0) {
      msg += ` | ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// Créer le logger avec plusieurs transports
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'notification-service' },
  transports: [
    // Écrire dans les fichiers de log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  // Ne pas planter en cas d'erreur dans le logger
  exitOnError: false
});

// En développement, afficher les logs dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  }));
}

// Ajouter des méthodes utilitaires supplémentaires
logger.logRequest = (req) => {
  // Ne pas loguer les données sensibles
  const sanitizedBody = { ...req.body };
  
  // Liste des champs sensibles à masquer
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'otp'];
  
  // Masquer les champs sensibles
  sensitiveFields.forEach(field => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = '******';
    }
  });
  
  logger.debug('Request received', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: sanitizedBody,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'accept': req.headers['accept']
    }
  });
};

logger.logResponse = (res, responseTime) => {
  logger.debug('Response sent', {
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`
  });
};

module.exports = logger;