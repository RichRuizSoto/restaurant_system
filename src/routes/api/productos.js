const express = require('express');
const router = express.Router();
const productosController = require('../../controllers/productosController');

router.post('/agregar', productosController.agregarProducto);
router.get('/:idRestaurante', productosController.obtenerProductosPorRestaurante);
router.get('/:restId/:id', productosController.obtenerProductoPorId);
router.put('/:restId/:id', productosController.actualizarProducto);
router.get('/activos/count/:idRestaurante', productosController.contarProductosActivos);

module.exports = router;
