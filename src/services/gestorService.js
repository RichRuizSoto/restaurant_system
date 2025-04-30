const Establecimiento = require('../models/Establecimiento'); // Importamos el modelo
const productosService = require('./productosService');
const db = require('../core/config/database'); // Ya tienes la conexión a la base de datos configurada
const slugify = require('slugify');

const existeRestaurante = async (nombre) => {
  try {
    const nombreNormalizado = nombre.trim().toLowerCase();
    const [rows] = await db.query('SELECT * FROM establecimientos WHERE LOWER(nombre) = ?', [nombreNormalizado]);
    return rows.length > 0;
  } catch (err) {
    console.error('Error al verificar si el restaurante ya existe:', err);
    throw new Error('Error al verificar el establecimiento');
  }
};

const crearEstablecimiento = async (nombre, estado = 'activo') => {
  try {
    const nombreNormalizado = nombre.trim(); // importante: mantenemos el original para guardar

    const existe = await existeRestaurante(nombreNormalizado);
    if (existe) {
      throw new Error('Ya existe un restaurante con ese nombre');
    }

    const slug = slugify(nombreNormalizado, {
      lower: true,
      strict: true,
      replacement: '_',
    });

    const [result] = await db.query(
      'INSERT INTO establecimientos (nombre, estado, slug, creado_en) VALUES (?, ?, ?, NOW())',
      [nombreNormalizado, estado, slug]
    );

    return {
      id: result.insertId,
      nombre: nombreNormalizado,
      estado,
      slug,
    };
  } catch (err) {
    console.error('Error al crear el establecimiento:', err);
    throw new Error(err.message || 'No se pudo crear el establecimiento');
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
  const connection = await db.getConnection(); // Obtener una conexión para transacción
  try {
    await connection.beginTransaction();

    // 1. Obtener todos los pedidos del restaurante
    const [pedidos] = await connection.query('SELECT id FROM pedidos WHERE id_restaurante = ?', [id]);
    const idsPedidos = pedidos.map(p => p.id);

    if (idsPedidos.length > 0) {
      // 2. Eliminar detalle_pedido relacionados a esos pedidos
      await connection.query('DELETE FROM detalle_pedido WHERE id_pedido IN (?)', [idsPedidos]);
    }

    // 3. Eliminar pedidos del restaurante
    await connection.query('DELETE FROM pedidos WHERE id_restaurante = ?', [id]);

    // 4. Eliminar productos del restaurante
    await connection.query('DELETE FROM productos WHERE id_restaurante = ?', [id]);

    // 5. Eliminar usuarios del restaurante
    await connection.query('DELETE FROM usuarios WHERE id_restaurante = ?', [id]);

    // 6. Finalmente, eliminar el establecimiento
    const [result] = await connection.query('DELETE FROM establecimientos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Establecimiento no encontrado');
    }

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error al eliminar el establecimiento y sus datos relacionados:', err);
    throw new Error('No se pudo eliminar el establecimiento');
  } finally {
    connection.release();
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