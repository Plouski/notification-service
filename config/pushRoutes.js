const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middlewares/validateRequest');
const pushController = require('../controllers/pushController');

/**
 * @route POST /api/push/send
 * @desc Envoie une notification push à un utilisateur spécifique
 * @access Private (requiert authentification)
 */
router.post('/send', 
  validateRequest({
    body: {
      userId: 'required|string',
      title: 'required|string',
      body: 'required|string',
      data: 'object',
      deviceToken: 'required|string'
    }
  }),
  pushController.sendPushNotification
);

/**
 * @route POST /api/push/send-to-topic
 * @desc Envoie une notification push à tous les utilisateurs abonnés à un sujet
 * @access Private (requiert authentification)
 */
router.post('/send-to-topic', 
  validateRequest({
    body: {
      topic: 'required|string',
      title: 'required|string',
      body: 'required|string',
      data: 'object'
    }
  }),
  pushController.sendTopicNotification
);

/**
 * @route POST /api/push/subscribe
 * @desc Abonne un appareil à un sujet
 * @access Private (requiert authentification)
 */
router.post('/subscribe', 
  validateRequest({
    body: {
      userId: 'required|string',
      deviceToken: 'required|string',
      topic: 'required|string'
    }
  }),
  pushController.subscribeToTopic
);

/**
 * @route POST /api/push/unsubscribe
 * @desc Désabonne un appareil d'un sujet
 * @access Private (requiert authentification)
 */
router.post('/unsubscribe', 
  validateRequest({
    body: {
      userId: 'required|string',
      deviceToken: 'required|string',
      topic: 'required|string'
    }
  }),
  pushController.unsubscribeFromTopic
);

/**
 * @route POST /api/push/ai-notification
 * @desc Envoie une notification de résultat d'IA disponible
 * @access Private (requiert authentification)
 */
router.post('/ai-notification', 
  validateRequest({
    body: {
      userId: 'required|string',
      deviceToken: 'required|string',
      resultId: 'required|string',
      modelName: 'string',
      processingTime: 'numeric'
    }
  }),
  pushController.sendAiResultNotification
);

/**
 * @route POST /api/push/subscription-notification
 * @desc Envoie une notification concernant l'abonnement (début/fin)
 * @access Private (requiert authentification)
 */
router.post('/subscription-notification', 
  validateRequest({
    body: {
      userId: 'required|string',
      deviceToken: 'required|string',
      event: 'required|string|in:started,ended,expiring',
      planName: 'required|string',
      daysLeft: 'numeric'
    }
  }),
  pushController.sendSubscriptionNotification
);

module.exports = router;