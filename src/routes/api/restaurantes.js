const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');

router.get('/:slug', restauranteController.obtenerRestaurantePorSlug);
router.get('/:slug/id', restauranteController.obtenerIdRestaurante);

module.exports = router;
