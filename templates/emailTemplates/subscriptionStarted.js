const Handlebars = require('handlebars');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation d'abonnement</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
    .subscription-details { margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-radius: 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirmation d'abonnement</h1>
    </div>
    <div class="content">
      <p>Bonjour {{firstName}},</p>
      <p>Nous vous confirmons l'activation de votre abonnement !</p>
      
      <div class="subscription-details">
        <p><strong>Formule :</strong> {{planName}}</p>
        <p><strong>Début :</strong> {{startDate}}</p>
        <p><strong>Prochain paiement :</strong> {{nextBillingDate}}</p>
        <p><strong>Montant :</strong> {{amount}} € / {{billingPeriod}}</p>
      </div>
      
      <p>Vous avez maintenant accès à toutes les fonctionnalités de cette formule.</p>
      <p>Merci pour votre confiance !</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

const text = `
Bonjour {{firstName}},

Nous vous confirmons l'activation de votre abonnement !

Formule : {{planName}}
Début : {{startDate}}
Prochain paiement : {{nextBillingDate}}
Montant : {{amount}} € / {{billingPeriod}}

Vous avez maintenant accès à toutes les fonctionnalités de cette formule.

Merci pour votre confiance !

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

module.exports = {
  html: Handlebars.compile(html),
  text: Handlebars.compile(text)
};