const express = require('express');
const router = express.Router();

// Ruta GET para renderizar login
router.get('/login', (req, res) => {
  res.render('login'); // Renderiza views/login.ejs
});

module.exports = router;
