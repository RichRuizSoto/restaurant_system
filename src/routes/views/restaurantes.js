const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');

router.get('/:slug/',restauranteController.renderizarVistaProductos);

module.exports = router;
