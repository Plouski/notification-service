const Handlebars = require('handlebars');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fin d'abonnement</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
    .resubscribe-button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fin d'abonnement</h1>
    </div>
    <div class="content">
      <p>Bonjour {{firstName}},</p>
      <p>Nous vous informons que votre abonnement {{planName}} a pris fin le {{endDate}}.</p>
      <p>Vous n'avez plus accès aux fonctionnalités premium de notre service.</p>
      <p>Vous pouvez vous réabonner à tout moment en cliquant sur le bouton ci-dessous :</p>
      <p style="text-align: center;">
        <a href="{{resubscribeLink}}" class="resubscribe-button">Se réabonner</a>
      </p>
      <p>Nous espérons vous revoir bientôt !</p>
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

Nous vous informons que votre abonnement {{planName}} a pris fin le {{endDate}}.

Vous n'avez plus accès aux fonctionnalités premium de notre service.

Vous pouvez vous réabonner à tout moment en visitant notre site :
{{resubscribeLink}}

Nous espérons vous revoir bientôt !

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

module.exports = {
  html: Handlebars.compile(html),
  text: Handlebars.compile(text)
};