const notificationService = require('../services/notificationService');

// Envoi d'un e-mail de confirmation
async function sendEmailConfirmation(req, res) {
    const { email } = req.body;

    // Créer un utilisateur fictif ou récupérer un utilisateur depuis ta base de données
    const user = { id: 123, email: email };  // Exemple d'utilisateur

    // Générer le token JWT pour l'utilisateur
    const token = notificationService.generateJWT(user);

    // Envoi de l'email de confirmation avec le token
    const result = await notificationService.sendEmailConfirmation(email, token);

    res.json(result);
}

// Envoi d'un SMS pour réinitialisation de mot de passe
async function sendResetPasswordSms(req, res) {
    const { phone, resetCode } = req.body;
    const result = await notificationService.sendSms(phone, resetCode);
    res.json(result);
}

// Envoi d'une notification push
async function sendPushNotification(req, res) {
    const { userId, title, body } = req.body;
    const result = await notificationService.sendPushNotification(userId, title, body);
    res.json(result);
}

module.exports = {
    sendEmailConfirmation,
    sendResetPasswordSms,
    sendPushNotification
};
