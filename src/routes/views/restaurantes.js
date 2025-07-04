const express = require('express');
const router = express.Router();
const restauranteController = require('../../controllers/restauranteController');
const { isAuthenticated, hasAccessToRestaurant, checkRoleAccess } = require('../../middlewares/auth');

router.get('/:slug/',restauranteController.renderizarVistaProductos);
router.get('/:slug/crear-empleado', (req, res) => {
  const { slug } = req.params;
  res.render('crearEmpleado', { slug });
});

module.exports = router;
