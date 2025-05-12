const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');
const { isAuthenticated, hasAccessToRestaurant, checkRoleAccess } = require('../../middlewares/auth');

router.get(
  '/vista/:slug',
  isAuthenticated,
  hasAccessToRestaurant,
  checkRoleAccess(['admin', 'gestor', 'empleado']),
  pedidosController.renderizarVistaPedidos
);

module.exports = router;