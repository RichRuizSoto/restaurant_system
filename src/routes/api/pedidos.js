const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');
const { isAuthenticated } = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/roles');



router.post('/', pedidosController.recibirPedido);
router.get('/orden/:numero', pedidosController.obtenerPedidoPorNumero);
router.get('/:id', isAuthenticated, authorizeRoles('admin', 'gestor', 'empleado'), pedidosController.verPedido);
router.get('/estado/:restId', isAuthenticated, authorizeRoles('admin', 'gestor', 'empleado'), pedidosController.obtenerPedidosPorEstado);
router.get('/hoy/:restId', isAuthenticated, authorizeRoles('admin', 'gestor', 'empleado'), pedidosController.obtenerCantidadPedidosHoy);
router.put('/:id/estado', isAuthenticated, authorizeRoles('admin', 'gestor', 'empleado'), pedidosController.actualizarEstadoPedido);
router.get('/ultimos/:restId', isAuthenticated, authorizeRoles('admin', 'gestor', 'empleado'), pedidosController.obtenerUltimosPedidos);


module.exports = router;
