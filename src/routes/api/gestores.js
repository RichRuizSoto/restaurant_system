const express = require('express');
const router = express.Router();
const gestorController = require('../../controllers/gestorController');
const validarRestaurante = require('../../middlewares/validaciones/restauranteValidaciones');

// API CRUD de establecimientos
router.post('/crear', validarRestaurante, gestorController.crearRestaurante);
router.get('/establecimientos', gestorController.listarEstablecimientos);
router.get('/establecimientos/:id', gestorController.obtenerEstablecimientoPorId);
router.put('/establecimientos/:id', gestorController.actualizarEstablecimiento);

module.exports = router;
