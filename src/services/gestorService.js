const Establecimiento = require('../models/Establecimiento'); // Importamos el modelo
const productosService = require('./productosService');

// Crear un establecimiento
const crearEstablecimiento = async (nombre, estado = 'activo') => {
  try {
    // Utilizamos el modelo para crear el establecimiento
    const nuevoEstablecimiento = await Establecimiento.crearEstablecimiento(nombre, estado);
    return nuevoEstablecimiento; // Retorna el nuevo establecimiento creado
  } catch (error) {
    console.error('Error en gestorService al crear el establecimiento:', error);
    throw new Error('No se pudo crear el establecimiento');
  }
};

// Listar todos los establecimientos
const listarEstablecimientos = async () => {
  try {
    const establecimientos = await Establecimiento.listarEstablecimientos(); // Usamos el modelo para listar
    return establecimientos;
  } catch (error) {
    console.error('Error al listar los establecimientos:', error);
    throw new Error('No se pudieron listar los establecimientos');
  }
};

// Obtener un establecimiento por ID
const obtenerEstablecimientoPorId = async (id) => {
  try {
    const establecimiento = await Establecimiento.obtenerEstablecimientoPorId(id); // Usamos el modelo para obtener por ID
    return establecimiento;
  } catch (error) {
    console.error('Error al obtener el establecimiento por ID:', error);
    throw new Error('No se pudo obtener el establecimiento');
  }
};

// Actualizar un establecimiento
const actualizarEstablecimiento = async (id, datosActualizados) => {
  try {
    const establecimientoActualizado = await Establecimiento.actualizarEstablecimiento(id, datosActualizados); // Usamos el modelo para actualizar
    return establecimientoActualizado;
  } catch (error) {
    console.error('Error al actualizar el establecimiento:', error);
    throw new Error('No se pudo actualizar el establecimiento');
  }
};

// Eliminar un establecimiento
const eliminarEstablecimiento = async (id) => {
  try {
    const resultado = await Establecimiento.eliminarEstablecimiento(id); // Usamos el modelo para eliminar
    return resultado;
  } catch (error) {
    console.error('Error al eliminar el establecimiento:', error);
    throw new Error('No se pudo eliminar el establecimiento');
  }
};


//Funciones traidas de productosService.js
const obtenerProductosPorRestaurante = async (idRestaurante) => {
  return await productosService.obtenerProductosPorRestaurante(idRestaurante);
};

const eliminarProductosPorRestaurante = async (idRestaurante) => {
  return await productosService.eliminarProductosPorRestaurante(idRestaurante);
};

module.exports = {
  crearEstablecimiento,
  listarEstablecimientos,
  obtenerEstablecimientoPorId,
  actualizarEstablecimiento,
  eliminarEstablecimiento,
  obtenerProductosPorRestaurante,
  eliminarProductosPorRestaurante
};