const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');

// Ruta para recibir un nuevo pedido (POST)
router.post('/', pedidosController.recibirPedido);

// Ruta para obtener un pedido por número de orden (GET)
router.get('/orden/:numero', pedidosController.obtenerPedidoPorNumero);

// Ruta para ver pedido por ID (GET)
router.get('/:id', pedidosController.verPedido);

// 📦 Obtener pedidos agrupados por estado
router.get('/estado/:restId', pedidosController.obtenerPedidosPorEstado);

// 🔁 Cambiar estado de un pedido
router.put('/:id/estado', pedidosController.actualizarEstadoPedido);

//router.get('/vista/:slug', pedidosController.renderizarVistaPedidos);


module.exports = router;
