const express = require('express');
const router = express.Router();
const usuariosController = require('../../controllers/usuariosController');

router.post('/crearAdministrador', usuariosController.crearAdministrador);
router.get('/administradores', usuariosController.mostrarAdministradores);
router.get('/administradores/:id', usuariosController.mostrarAdministrador);
router.put('/administradores/:id', usuariosController.editarInformacionAdministrador);
router.delete('/administradores/:id', usuariosController.eliminarAdministrador);

router.post('/crearEmpleado', usuariosController.crearEmpleado);
router.get('/empleados', usuariosController.mostrarEmpleados);
router.get('/empleados/:id', usuariosController.mostrarEmpleado);
router.put('/empleados/:id', usuariosController.editarInformacionEmpleado);
router.delete('/empleados/:id', usuariosController.eliminarEmpleado);
router.get('/empleados/count/:restauranteId', usuariosController.contarPerfilesPorRestaurante);
router.get('/empleados/por-restaurante/:restauranteId', usuariosController.mostrarPerfilesPorRestaurante);


module.exports = router;
