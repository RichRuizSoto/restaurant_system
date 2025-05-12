const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');
const { isAuthenticated, hasAccessToRestaurant, checkRoleAccess } = require('../../middlewares/auth');

router.get(
  '/:slug/productos',
  isAuthenticated,
  hasAccessToRestaurant,
  checkRoleAccess(['admin', 'gestor']),
  restauranteController.renderizarVistaProductos
);

module.exports = router;
