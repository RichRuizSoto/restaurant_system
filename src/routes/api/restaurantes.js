// src/routes/api/restaurante.routes.js
const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');

// 🔹 API para obtener un restaurante por slug (usada por frontend)
router.get('/:slug', restauranteController.obtenerRestaurantePorSlug);

// 🔹 Obtener ID de restaurante por slug (usado para lógica interna o validación)
router.get('/:slug/id', restauranteController.obtenerIdRestaurante);

module.exports = router;
