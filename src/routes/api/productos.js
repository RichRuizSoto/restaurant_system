const express = require('express');
const router = express.Router();
const productosController = require('../../controllers/productosController');
const {
  validarProductoCreacion,
  validarDisponibilidad,
  validarDatosActualizacion,
  validarExistenciaRestaurante,
  validarExistenciaProducto
} = require('../../middlewares/validaciones/productosValidaciones');

// 🟢 API para eliminar todos los productos de un restaurante
router.post('/agregar', validarProductoCreacion, validarExistenciaRestaurante, productosController.agregarProducto);

router.get('/:idRestaurante', productosController.obtenerProductosPorRestaurante);

router.get('/:restId/:id', validarExistenciaProducto, productosController.obtenerProductoPorId);
//router.get('/api/productos/:idRestaurante', productosController.obtenerPorRestaurante);
router.put('/:restId/:id', validarDatosActualizacion, validarDisponibilidad, validarExistenciaProducto, productosController.actualizarProducto);
router.delete('/:restId/:id', validarExistenciaProducto, productosController.eliminarProducto);
router.delete('/restaurante/:idRestaurante', productosController.eliminarProductosPorRestaurante);

module.exports = router;
