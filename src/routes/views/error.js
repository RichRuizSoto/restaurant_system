const express = require('express');
const router = express.Router();

router.get('/acceso-denegado', (req, res) => {
  res.status(403).render('acceso-denegado');
});

module.exports = router;
