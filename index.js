const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const notificationRoutes = require('./routes/notificationRoutes');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

app.use(bodyParser.json());
app.use('/notifications', notificationRoutes);

app.listen(5005, () => {
    console.log('Service de notification en écoute sur le port 5005');
});
