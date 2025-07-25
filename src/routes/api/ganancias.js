const express = require('express');
const router = express.Router();
const gananciasController = require('../../controllers/gananciasController');

router.get('/por-dia', gananciasController.obtenerGananciasPorDia);
router.get('/ingresos/hoy/:restId', gananciasController.getIngresosHoy);


module.exports = router;


//router.get('/por-dia', isAuthenticated, hasAccessToRestaurant, checkRoleAccess(['gestor', 'admin', 'empleado']), gananciasController.obtenerGananciasPorDia);
