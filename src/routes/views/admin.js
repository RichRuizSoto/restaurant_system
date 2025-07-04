const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');

// Ruta protegida con autenticación
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  res.render('admin', { slug });
});

module.exports = router;
