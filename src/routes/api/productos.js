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

router.post('/agregar', validarProductoCreacion, validarExistenciaRestaurante, productosController.agregarProducto);
router.get('/:idRestaurante', productosController.obtenerProductosPorRestaurante);
router.get('/:restId/:id', validarExistenciaProducto, productosController.obtenerProductoPorId);
router.put('/:restId/:id', validarDatosActualizacion, validarDisponibilidad, validarExistenciaProducto, productosController.actualizarProducto);

module.exports = router;
