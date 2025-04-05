/**
 * Modèles de messages SMS
 * Utilise Handlebars pour les templates
 */
module.exports = {
    /**
     * Template pour le code de réinitialisation de mot de passe
     */
    'password-reset': 'Votre code de réinitialisation est: {{otp}}. Valable pendant {{expiryMinutes}} minutes. Ne le partagez avec personne.',

    /**
     * Template pour la confirmation d'une action
     */
    'action-confirmation': 'Votre action a été confirmée. Code de confirmation: {{confirmationCode}}',

    /**
     * Template pour un avertissement de sécurité
     */
    'security-alert': 'Alerte de sécurité: {{alertMessage}}. Si ce n\'est pas vous, contactez notre support.',

    /**
     * Template pour une notification d'abonnement
     */
    'subscription-notification': 'Votre abonnement {{planName}} {{action}}. Plus d\'infos sur votre espace client.',

    /**
     * Template pour une notification d'expiration 
     */
    'expiration-reminder': 'Rappel: Votre {{itemType}} expire dans {{timeLeft}}. Renouvelez-le sur notre site.',

    /**
     * Template pour une notification de transaction financière
     */
    'transaction-notification': 'Transaction de {{amount}}€ effectuée sur votre compte. Ref: {{reference}}',

    /**
     * Template pour une notification de démarrage de voyage
     */
    'trip-start': 'Votre voyage {{tripName}} commence {{startDate}}. Bon voyage!',

    /**
     * Template pour un rappel d'événement
     */
    'event-reminder': 'Rappel: {{eventName}} {{timeInfo}}. {{additionalInfo}}'
};