const Handlebars = require('handlebars');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de votre compte</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirmation de votre compte</h1>
    </div>
    <div class="content">
      <p>Bonjour {{firstName}},</p>
      <p>Merci pour votre inscription ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
      <p style="text-align: center;">
        <a href="{{confirmationLink}}" class="button">Confirmer mon compte</a>
      </p>
      <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller le lien suivant dans votre navigateur :</p>
      <p>{{confirmationLink}}</p>
      <p>Ce lien expirera dans 24 heures.</p>
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

Merci pour votre inscription ! Pour activer votre compte, veuillez cliquer sur le lien suivant :

{{confirmationLink}}

Ce lien expirera dans 24 heures.

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

module.exports = {
  html: Handlebars.compile(html),
  text: Handlebars.compile(text)
};