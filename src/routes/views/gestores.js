// src/routes/views/gestores.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Ruta para acceder a la vista del gestor
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/gestionRestaurantes/gestor.html'));
});

module.exports = router;
