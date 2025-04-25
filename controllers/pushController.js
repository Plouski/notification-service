const messaging = require("../config/firebase-admin");
const User = require("../models/User");

/**
 * Enregistre le token de notification push pour un utilisateur
 */
exports.savePushToken = async (req, res) => {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
        return res.status(400).json({ message: "userId et token sont requis" });
    }
    
    try {
        // Correction de la validation du token - Ajout d'une notification requise pour dryRun
        try {
            await messaging.send({
                token,
                notification: { 
                    title: "Bienvenue à ROADTRIP!", 
                    body: "Vous êtes admin" 
                }
            });
        } catch (tokenError) {
            console.error("❌ Erreur de validation du token:", tokenError);
            
            // Vérifier si tokenError a la propriété code
            if (tokenError && tokenError.code === 'messaging/registration-token-not-registered') {
                console.warn(`⚠️ Token invalide reçu pour userId ${userId}`);
                return res.status(400).json({ 
                    message: "Token de notification invalide", 
                    error: "TOKEN_INVALID" 
                });
            }
            // Si l'erreur n'est pas liée à un token invalide, on continue mais on log l'erreur
            console.warn(`⚠️ Erreur lors de la validation du token pour userId ${userId}:`, 
                        tokenError && tokenError.code ? tokenError.code : "type d'erreur inconnu");
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                pushToken: token,
                pushTokenUpdatedAt: new Date(),
                pushTokenValid: true  // Marquer le token comme valide lors de l'enregistrement
            },
            { new: true, upsert: false }
        );
        
        if (!user) {
            console.warn(`⚠️ Utilisateur introuvable lors de l'enregistrement du token: ${userId}`);
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        
        res.status(200).json({ message: "Token enregistré avec succès" });
    } catch (error) {
        console.error("❌ Erreur en enregistrant le token :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Envoie une notification push à un utilisateur spécifique
 * Version corrigée et simplifiée
 */
exports.sendPushNotification = async (req, res) => {
    const { userId, title, body, data = {} } = req.body;
    console.log("📱 Requête d'envoi de notification:", { userId, title, bodyLength: body?.length });
    
    if (!userId || !title) {
        return res.status(400).json({ message: "userId et title sont requis" });
    }
    
    try {
        const user = await User.findById(userId);
        console.log("🔍 Utilisateur trouvé:", user ? `ID: ${user._id}, Token valid: ${user.pushTokenValid}` : "Non trouvé");
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        
        if (!user.pushToken) {
            console.warn(`⚠️ Token push non enregistré pour l'utilisateur ${userId}`);
            return res.status(404).json({ message: "Token push non enregistré pour cet utilisateur" });
        }
        
        // Structure MESSAGE SIMPLIFIÉE - Utiliser cette version d'abord pour tester
        const message = {
            token: user.pushToken,
            notification: {
                title,
                body: body || ""
            },
            // Données minimales nécessaires
            data: {
                title: title.toString(),
                body: (body || "").toString(),
                timestamp: Date.now().toString()
            }
        };
                
        try {
            const messageId = await messaging.send(message);
            console.log(`✅ Notification envoyée à ${userId}, messageId: ${messageId}`);
            
            // Mettre à jour le statut du token
            await User.findByIdAndUpdate(userId, {
                pushTokenValid: true,
                lastNotificationSent: new Date()
            });
            
            res.status(200).json({ 
                message: "Notification envoyée avec succès",
                messageId 
            });
        } catch (fcmError) {
            console.error("❌ Erreur FCM:", fcmError);
            
            // Gestion spécifique des erreurs FCM
            if (fcmError && fcmError.code === 'messaging/registration-token-not-registered') {
                console.warn(`⚠️ Token invalide détecté pour l'utilisateur ${userId}`);
                
                // Mettre à jour le statut du token dans la base de données
                await User.findByIdAndUpdate(userId, {
                    pushTokenValid: false
                });
                
                return res.status(400).json({ 
                    message: "Token de notification invalide ou expiré",
                    error: "TOKEN_INVALID"
                });
            }
            
            // Pour toute autre erreur FCM
            console.error(`❌ Erreur FCM spécifique:`, fcmError.code || "Erreur inconnue");
            throw fcmError; // Relancer pour la gestion générale d'erreur
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de la notification:", error);
        res.status(500).json({ 
            message: "Erreur lors de l'envoi de la notification",
            error: error && error.code ? error.code : "UNKNOWN_ERROR"
        });
    }
};