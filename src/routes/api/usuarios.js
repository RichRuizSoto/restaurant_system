const express = require('express');
const router = express.Router();
const usuariosController = require('../../controllers/usuariosController');

router.post('/crearAdministrador', usuariosController.crearAdministrador);
router.get('/administradores', usuariosController.mostrarAdministradores);
router.get('/administradores/:id', usuariosController.mostrarAdministrador);
router.put('/administradores/:id', usuariosController.editarInformacionAdministrador);
router.delete('/administradores/:id', usuariosController.eliminarAdministrador);

module.exports = router;
