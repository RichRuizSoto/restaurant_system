const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');
const { restrictToOwnRestaurante } = require('../../middleware/restauranteAccess');

// Capturamos el slug de la URL y aplicamos el middleware para restringir el acceso al restaurante
router.get('/:slug', restrictToOwnRestaurante, restauranteController.renderizarVistaProductos);

module.exports = router;
