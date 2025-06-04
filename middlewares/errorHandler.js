const errorHandler = (err, req, res, next) => {
    console.error('💥 Middleware Error Handler:', err);

    res.status(err.statusCode || 500).json({
        error: err.message || 'Erreur interne du serveur',
    });
};

module.exports = errorHandler;