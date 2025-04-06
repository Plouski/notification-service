const Handlebars = require('handlebars');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre facture</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
    .invoice-details { margin: 20px 0; }
    .invoice-table { width: 100%; border-collapse: collapse; }
    .invoice-table th, .invoice-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .invoice-total { font-weight: bold; margin-top: 20px; text-align: right; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Votre facture</h1>
    </div>
    <div class="content">
      <p>Bonjour {{firstName}},</p>
      <p>Veuillez trouver ci-dessous votre facture pour votre abonnement :</p>
      
      <div class="invoice-details">
        <p><strong>Facture n° :</strong> {{invoiceNumber}}</p>
        <p><strong>Date :</strong> {{invoiceDate}}</p>
        <p><strong>Période de facturation :</strong> {{billingPeriod}}</p>
      </div>
      
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{this.description}}</td>
            <td>{{this.quantity}}</td>
            <td>{{this.price}} €</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
      
      <div class="invoice-total">
        <p>Total HT : {{totalHT}} €</p>
        <p>TVA ({{vatRate}}%) : {{vatAmount}} €</p>
        <p>Total TTC : {{totalTTC}} €</p>
      </div>
      
      <p>Nous vous remercions pour votre confiance.</p>
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

Veuillez trouver ci-dessous votre facture pour votre abonnement :

Facture n° : {{invoiceNumber}}
Date : {{invoiceDate}}
Période de facturation : {{billingPeriod}}

{{#each items}}
- {{this.description}} - {{this.quantity}} x {{this.price}} €
{{/each}}

Total HT : {{totalHT}} €
TVA ({{vatRate}}%) : {{vatAmount}} €
Total TTC : {{totalTTC}} €

Nous vous remercions pour votre confiance.

Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

module.exports = {
  html: Handlebars.compile(html),
  text: Handlebars.compile(text)
};