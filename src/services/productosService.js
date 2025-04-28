const Producto = require('../models/producto');  // Asegúrate de que este es el nombre correcto de tu archivo modelo
const db = require('../core/config/database');

// 📥 Crear producto
const crearProducto = async (datosProducto) => {
  console.log('📥 En productosService: creando producto...');
  return await Producto.crearProducto(datosProducto);  // Llamada al método del modelo
};

// 🛒 Obtener todos los productos de un restaurante
const obtenerProductosPorRestaurante = async (id_restaurante) => {
  return await Producto.obtenerProductosPorRestaurante(id_restaurante);  // Llamada al método del modelo
};

// 🔍 Obtener un producto por su ID
const obtenerProductoPorId = async (id) => {
  return await Producto.obtenerProductoPorId(id);  // Llamada al método del modelo
};

// ✏️ Actualizar campos de un producto (ej: disponibilidad)
const actualizarProducto = async (id, datosActualizados) => {
  return await Producto.actualizarProducto(id, datosActualizados);  // Llamada al método del modelo
};

// 🗑️ Eliminar un producto por su ID
const eliminarProducto = async (id) => {
  return await Producto.eliminarProducto(id);  // Llamada al método del modelo
};

// En productosService.js
const eliminarProductosPorRestaurante = async (idRestaurante) => {
  return await Producto.eliminarProductosPorRestaurante(idRestaurante);
};



module.exports = {
  crearProducto,
  obtenerProductosPorRestaurante,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  eliminarProductosPorRestaurante
};
