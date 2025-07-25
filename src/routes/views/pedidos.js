const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');
const { restrictToOwnRestaurante } = require('../../middleware/restauranteAccess');

router.get(
  '/:slug', 
  restrictToOwnRestaurante, // Aseguramos que solo los usuarios con acceso al restaurante puedan acceder a este pedido
  pedidosController.renderizarVistaPedidos // El controlador se encargará de procesar la vista
);

module.exports = router;
