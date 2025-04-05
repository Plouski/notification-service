const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

// Configuration de Nodemailer pour l'envoi d'email
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Tu peux aussi utiliser un autre service (comme SendGrid, etc.)
    auth: {
        user: process.env.EMAIL_USER,  // Ton adresse e-mail pour l'authentification
        pass: process.env.EMAIL_PASS,  // Ton mot de passe pour l'authentification
    }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);  // SID et token depuis .env

class NotificationService {

    // Générer un token JWT pour un utilisateur
    generateJWT(user) {
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,  // Utilise la clé secrète définie dans ton fichier .env
            { expiresIn: '1h' }
        );
        return token;
    }

    // Fonction pour formater le numéro en E.164
    formatPhoneNumber(phoneNumber) {
        // Si le numéro ne commence pas par "+", ajoute l'indicatif international (+33 pour la France ici)
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+33' + phoneNumber.slice(1);  // Remplace "0" par "+33" pour la France
        }
        return phoneNumber;
    }

    // Envoi de l'email de confirmation
    async sendEmailConfirmation(userEmail, token) {
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Utilise l'adresse e-mail de l'expéditeur
            to: userEmail,  // L'adresse e-mail de l'utilisateur
            subject: 'Confirmation de votre e-mail',
            text: `Veuillez confirmer votre e-mail en cliquant sur ce lien : http://ton_serveur.com/confirm-email?token=${token}`,
        };
        
        try {
            const info = await transporter.sendMail(mailOptions);  // Envoi de l'e-mail
            console.log('Email envoyé:', info.response);
            return { success: true, message: 'E-mail envoyé avec succès' };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            return { success: false, message: error.message };
        }
    }

    // Envoi du SMS (pour la réinitialisation du mot de passe)
    async sendSms(userPhone, resetCode) {
        // Formatage du numéro avant l'envoi
        const formattedPhone = this.formatPhoneNumber(userPhone);
        
        try {
            const message = await twilioClient.messages.create({
                body: `Votre code de réinitialisation est : ${resetCode}`,
                from: process.env.TWILIO_PHONE_NUMBER,  // Ton numéro Twilio
                to: formattedPhone
            });
            console.log('SMS envoyé:', message.sid);
            return { success: true, message: 'SMS envoyé avec succès' };
        } catch (error) {
            console.error('Erreur lors de l\'envoi du SMS:', error);
            return { success: false, message: error.message };
        }
    }

    // Suivi de l'état de la livraison des messages
    async trackDeliveryStatus(messageId) {
        // Implémenter ici le suivi spécifique selon les services utilisés
        return { success: true, message: `Statut pour le message ID ${messageId} : livré` };
    }
}

module.exports = new NotificationService();
