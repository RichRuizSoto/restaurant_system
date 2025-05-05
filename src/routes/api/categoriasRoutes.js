// routes/categoriasRoutes.js

const express = require('express');
const router = express.Router();
const categoriasController = require('../../controllers/categoriasController');

// 🟢 Ruta para agregar una nueva categoría
router.post('/agregar', categoriasController.agregarCategoria);

// 🔍 Ruta para obtener todas las categorías
router.get('/', categoriasController.obtenerCategorias);

// 🔍 Ruta para obtener una categoría específica por ID
router.get('/:id', categoriasController.obtenerCategoriaEspecifica);

// 🔄 Ruta para actualizar una categoría
router.put('/:id', categoriasController.actualizarCategoria);

// 🗑️ Ruta para eliminar una categoría
router.delete('/:id', categoriasController.eliminarCategoria);

module.exports = router;
