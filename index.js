require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'notification-service' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong'
  });
});

app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
});

module.exports = app;