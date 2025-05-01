const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');

router.post('/', pedidosController.recibirPedido);
router.get('/orden/:numero', pedidosController.obtenerPedidoPorNumero);
router.get('/:id', pedidosController.verPedido);
router.get('/estado/:restId', pedidosController.obtenerPedidosPorEstado);
router.put('/:id/estado', pedidosController.actualizarEstadoPedido);

module.exports = router;
