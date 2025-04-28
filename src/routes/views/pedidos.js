const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');

router.get('/vista/:slug', pedidosController.renderizarVistaPedidos);

module.exports = router;
