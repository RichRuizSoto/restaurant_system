// src/middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
    console.error('🔥 Error:', err.message);
    res.status(err.status || 500).json({
      error: err.message || 'Error interno del servidor'
    });
  };
  