// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');

// Vista de login (GET)
router.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para el login (POST)
router.post('/login', authController.login);

module.exports = router;
