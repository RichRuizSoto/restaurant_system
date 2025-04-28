// src/routes/views/restaurante.routes.js
const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');

// 🔹 Renderiza la vista dinámica con productos del restaurante
router.get('/:slug/productos', restauranteController.renderizarVistaProductos);

module.exports = router;
