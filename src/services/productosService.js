const db = require('../core/config/database');

// 🔽 MODELO

// 🟢 Crear un nuevo producto
const crearProducto = async ({ id_restaurante, nombre_producto, descripcion, precio, disponible = 1, categoria }) => {
  const sql = `
    INSERT INTO productos (id_restaurante, nombre_producto, descripcion, precio, disponible, categoria)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const valores = [id_restaurante, nombre_producto, descripcion, precio, disponible, categoria];

  console.log('📦 Ejecutando INSERT con valores:', valores);

  const [result] = await db.query(sql, valores);

  console.log('✅ Producto insertado con ID:', result.insertId);
  return {
    id: result.insertId,
    id_restaurante,
    nombre_producto,
    descripcion,
    precio,
    disponible,
    categoria
  };
};

// 📦 Obtener todos los productos de un restaurante
const obtenerProductosPorRestaurante = async (id_restaurante) => {
  const sql = `
    SELECT 
      p.*, 
      c.nombre AS nombre_categoria 
    FROM productos p
    JOIN categorias c ON p.categoria = c.id
    WHERE p.id_restaurante = ?
    ORDER BY p.creado_en DESC
  `;
  const [results] = await db.query(sql, [id_restaurante]);
  return results;
};

const obtenerProductosActivos = async (id_restaurante) => {
  const sql = `
    SELECT 
      p.*, 
      c.nombre AS nombre_categoria 
    FROM productos p
    JOIN categorias c ON p.categoria = c.id
    WHERE p.id_restaurante = ?
      AND p.disponible = 1
    ORDER BY p.creado_en DESC
  `;
  const [results] = await db.query(sql, [id_restaurante]);
  return results;
};


// 🔍 Obtener un producto por su ID
const obtenerProductoPorId = async (id) => {
  const sql = `SELECT * FROM productos WHERE id = ?`;
  const [results] = await db.query(sql, [id]);
  return results.length ? results[0] : null;
};

// ✏️ Actualizar producto
const actualizarProducto = async (id, datosActualizados) => {
  if (!id || !datosActualizados || typeof datosActualizados !== 'object') {
    throw new Error('Parámetros inválidos para actualizar producto');
  }

  const campos = [];
  const valores = [];

  for (const [clave, valor] of Object.entries(datosActualizados)) {
    campos.push(`${clave} = ?`);
    valores.push(valor);
  }

  if (campos.length === 0) {
    throw new Error('No se proporcionaron campos para actualizar');
  }

  valores.push(id);
  const sql = `UPDATE productos SET ${campos.join(', ')} WHERE id = ?`;
  await db.query(sql, valores);

  return { id, ...datosActualizados };
};

// 🗑️ Eliminar producto
const eliminarProducto = async (id) => {
  const sql = `DELETE FROM productos WHERE id = ?`;
  await db.query(sql, [id]);
};

// 🗑️ Eliminar productos por restaurante
const eliminarProductosPorRestaurante = async (idRestaurante) => {
  try {
    const [result] = await db.query('DELETE FROM productos WHERE id_restaurante = ?', [idRestaurante]);
    console.log(`✅ Productos eliminados para el restaurante con id ${idRestaurante}`);
    return result;
  } catch (error) {
    console.error('❌ Error al eliminar productos:', error);
    throw new Error('Error al eliminar productos');
  }
};

// 🔼 SERVICIO (mismo archivo, simplemente reexpone las funciones)

module.exports = {
  crearProducto,
  obtenerProductosPorRestaurante,
  obtenerProductoPorId,
  obtenerProductosActivos,
  actualizarProducto,
  eliminarProducto,
  eliminarProductosPorRestaurante
};
