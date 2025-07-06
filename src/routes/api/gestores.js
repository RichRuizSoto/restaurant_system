const express = require('express');
const router = express.Router();
const gestorController = require('../../controllers/gestorController');

router.post('/crear', gestorController.crearRestaurante);
router.get('/establecimientos', gestorController.listarEstablecimientos);
router.get('/establecimientos/:id', gestorController.obtenerEstablecimientoPorId);
router.put('/establecimientos/:id', gestorController.actualizarEstablecimiento);

module.exports = router;