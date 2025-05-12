const express = require('express');
const router = express.Router();
const gananciasController = require('../../controllers/gananciasController');
const { isAuthenticated, hasAccessToRestaurant, checkRoleAccess } = require('../../middlewares/auth');

router.get('/por-dia', gananciasController.obtenerGananciasPorDia);

module.exports = router;


//router.get('/por-dia', isAuthenticated, hasAccessToRestaurant, checkRoleAccess(['gestor', 'admin', 'empleado']), gananciasController.obtenerGananciasPorDia);
