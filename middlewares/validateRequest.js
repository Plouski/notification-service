const { check, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Middleware de validation des requêtes
 * @param {Object} schema - Schéma de validation avec fields et leurs règles
 * @returns {Function} Middleware pour Express
 */
const validateRequest = (schema) => {
  return async (req, res, next) => {
    // Initialiser le tableau des validateurs
    const validators = [];

    // Traiter le schéma de validation
    if (schema.body) {
      // Parcourir les champs du body pour construire les validateurs
      Object.keys(schema.body).forEach(field => {
        const rules = schema.body[field].split('|');

        rules.forEach(rule => {
          let validator = check(field);

          if (rule === 'required') {
            validator = validator.notEmpty().withMessage(`${field} est requis`);
          }

          if (rule === 'email') {
            validator = validator.isEmail().withMessage(`${field} doit être un email valide`);
          }

          if (rule === 'string') {
            validator = validator.isString().withMessage(`${field} doit être une chaîne de caractères`);
          }

          // Règle "numeric" ou "number"
          else if (rule === 'numeric' || rule === 'number') {
            validator = validator.isNumeric().withMessage(`${field} doit être un nombre`);
          }

          // Règle "boolean"
          else if (rule === 'boolean') {
            validator = validator.isBoolean().withMessage(`${field} doit être un booléen`);
          }

          // Règle "date"
          else if (rule === 'date') {
            validator = validator.isISO8601().withMessage(`${field} doit être une date valide`);
          }

          // Règle "array"
          else if (rule === 'array') {
            validator = validator.isArray().withMessage(`${field} doit être un tableau`);
          }

          // Règle "object"
          else if (rule === 'object') {
            validator = validator.custom(value => typeof value === 'object' && !Array.isArray(value))
              .withMessage(`${field} doit être un objet`);
          }

          // Règle "min:x"
          else if (rule.startsWith('min:')) {
            const min = parseInt(rule.split(':')[1]);
            validator = validator.isLength({ min }).withMessage(`${field} doit contenir au moins ${min} caractères`);
          }

          // Règle "max:x"
          else if (rule.startsWith('max:')) {
            const max = parseInt(rule.split(':')[1]);
            validator = validator.isLength({ max }).withMessage(`${field} ne doit pas dépasser ${max} caractères`);
          }

          // Règle "in:a,b,c"
          else if (rule.startsWith('in:')) {
            const values = rule.split(':')[1].split(',');
            validator = validator.isIn(values).withMessage(`${field} doit être l'une des valeurs suivantes: ${values.join(', ')}`);
          }

          // Ajouter le validateur au tableau
          validators.push(validator);
        });
      });
    }

    // Exécuter les validateurs
    await Promise.all(validators.map(validator => validator.run(req)));

    // Vérifier les résultats de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return formatResponse(
        res,
        400,
        'Erreur de validation des données',
        null,
        {
          message: 'Données invalides',
          details: errors.array().map(err => ({
            field: err.path,
            message: err.msg
          }))
        }
      );
    }

    next();
  };
};

module.exports = { validateRequest };