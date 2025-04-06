const Handlebars = require('handlebars');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Échec de paiement</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
    .alert { background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .update-payment-button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Échec de paiement</h1>
    </div>
    <div class="content">
      <p>Bonjour {{firstName}},</p>
      <div class="alert">
        <p>Nous n'avons pas pu prélever le paiement de votre abonnement {{planName}}.</p>
        <p><strong>Raison :</strong> {{failureReason}}</p>
      </div>
      <p>Veuillez mettre à jour vos informations de paiement dès que possible pour éviter l'interruption de votre service.</p>
      <p style="text-align: center;">
        <a href="{{updatePaymentLink}}" class="update-payment-button">Mettre à jour mon moyen de paiement</a>
      </p>
      <p>En cas de problème, n'hésitez pas à contacter notre service client.</p>
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

Nous n'avons pas pu prélever le paiement de votre abonnement {{planName}}.

Raison : {{failureReason}}

Veuillez mettre à jour vos informations de paiement dès que possible pour éviter l'interruption de votre service :
{{updatePaymentLink}}

En cas de problème, n'hésitez pas à contacter notre service client.

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

module.exports = {
  html: Handlebars.compile(html),
  text: Handlebars.compile(text)
};