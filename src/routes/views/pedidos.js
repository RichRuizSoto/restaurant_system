const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');
const { isAuthenticated, hasAccessToRestaurant } = require('../../middlewares/auth');

router.get('/vista/:slug', isAuthenticated, hasAccessToRestaurant, pedidosController.renderizarVistaPedidos);

module.exports = router;