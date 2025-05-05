// controllers/categoriasController.js

const categoriasService = require('../services/categoriasService');

// 🟢 Crear nueva categoría
exports.agregarCategoria = async (req, res, next) => {
  try {
    const { nombre_categoria } = req.body;

    if (!nombre_categoria) {
      return res.status(400).json({ error: 'Falta el campo "nombre_categoria".' });
    }

    const nuevaCategoria = await categoriasService.crearCategoria(nombre_categoria);
    res.status(201).json({
      mensaje: 'Categoría agregada con éxito',
      categoria: nuevaCategoria
    });
  } catch (error) {
    console.error('❌ Error al agregar categoría:', error);
    next(error);
  }
};

// 📦 Obtener todas las categorías
exports.obtenerCategorias = async (req, res, next) => {
  try {
    const categorias = await categoriasService.obtenerCategorias();
    res.json(categorias);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    next(error);
  }
};

// 🔍 Obtener una categoría específica por ID
exports.obtenerCategoriaEspecifica = async (req, res, next) => {
  try {
    const { id } = req.params; // Obtener el ID desde los parámetros de la URL

    const categoria = await categoriasService.obtenerCategoriaPorId(id);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('❌ Error al obtener la categoría específica:', error);
    next(error);
  }
};

// 🔄 Actualizar una categoría
exports.actualizarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params; // El ID de la categoría
    const { nombre_categoria } = req.body; // El nuevo nombre de la categoría

    if (!nombre_categoria) {
      return res.status(400).json({ error: 'Falta el campo "nombre_categoria".' });
    }

    const categoriaActualizada = await categoriasService.actualizarCategoria(id, nombre_categoria);
    
    if (!categoriaActualizada) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    res.json({
      mensaje: 'Categoría actualizada con éxito',
      categoria: categoriaActualizada
    });
  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
    next(error);
  }
};

// 🗑️ Eliminar una categoría
exports.eliminarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoriaEliminada = await categoriasService.eliminarCategoria(id);

    if (!categoriaEliminada) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    res.json({
      mensaje: 'Categoría eliminada con éxito',
      categoria: categoriaEliminada
    });
  } catch (error) {
    console.error('❌ Error al eliminar categoría:', error);
    next(error);
  }
};
