const express = require('express');
const router = express.Router();
const categoriasController = require('../../controllers/categoriasController');

router.post('/agregar', categoriasController.agregarCategoria);
router.get('/', categoriasController.obtenerCategorias);
router.get('/:id', categoriasController.obtenerCategoriaEspecifica);
router.put('/:id', categoriasController.actualizarCategoria);
router.delete('/:id', categoriasController.eliminarCategoria);

module.exports = router;
