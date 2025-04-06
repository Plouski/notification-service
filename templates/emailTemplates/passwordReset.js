const Handlebars = require('handlebars');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
    .code { font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #eee; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Réinitialisation de votre mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour {{firstName}},</p>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Voici votre code de réinitialisation :</p>
      <div class="code">{{resetCode}}</div>
      <p>Ce code est valable pendant 15 minutes.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
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

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Voici votre code de réinitialisation :

{{resetCode}}

Ce code est valable pendant 15 minutes.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

module.exports = {
  html: Handlebars.compile(html),
  text: Handlebars.compile(text)
};