const axios = require("axios");

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || 'http://localhost:5002';

// Récupère les informations d'un utilisateur par son identifiant
exports.getUserById = async (userId) => {
    const res = await axios.get(`${DATA_SERVICE_URL}/api/users/${userId}`);
    return res.data;
};

//  Met à jour les informations d'un utilisateur
exports.updateUser = async (userId, update) => {
    const res = await axios.put(`${DATA_SERVICE_URL}/api/users/${userId}`, update);
    return res.data;
};
