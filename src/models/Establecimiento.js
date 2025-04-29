const db = require('../core/config/database'); // Ya tienes la conexión a la base de datos configurada
const slugify = require('slugify'); // Librería para generar slugs
const {
  renombrarEstructuraRestaurante
} = require('../utils/restauranteFileManager');

// Obtiene todos los establecimientos desde la base de datos
const listarEstablecimientos = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM establecimientos');
    return rows;
  } catch (err) {
    console.error('Error al listar los establecimientos:', err);
    throw new Error('No se pudieron listar los establecimientos');
  }
};

// Crea un nuevo establecimiento con un slug generado a partir del nombre
const crearEstablecimiento = async (nombre, estado = 'activo') => {
  try {
    // Generar el slug del nombre utilizando slugify
    const slug = slugify(nombre, {
      lower: true,
      strict: true,
      replacement: '_', // Reemplaza los espacios con guiones bajos
    });

    // Inserta el establecimiento en la base de datos con el slug generado
    const [result] = await db.query('INSERT INTO establecimientos (nombre, estado, slug, creado_en) VALUES (?, ?, ?, NOW())', [nombre, estado, slug]);

    return {
      id: result.insertId, // Retorna el ID del establecimiento recién creado
      nombre,
      estado,
      slug,
    };
  } catch (err) {
    console.error('Error al crear el establecimiento:', err);
    throw new Error('No se pudo crear el establecimiento');
  }
};

// Obtener un establecimiento por ID
const obtenerEstablecimientoPorId = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM establecimientos WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw new Error('Establecimiento no encontrado');
    }
    return rows[0];
  } catch (err) {
    console.error('Error al obtener el establecimiento por ID:', err);
    throw new Error('No se pudo obtener el establecimiento');
  }
};

// Actualiza un establecimiento
const actualizarEstablecimiento = async (id, datosActualizados) => {
  try {
    const establecimientoActual = await obtenerEstablecimientoPorId(id);
    const slugViejo = establecimientoActual.slug;

    // Si se actualiza el nombre, hay que regenerar el slug y mover la carpeta
    if (datosActualizados.nombre) {
      const nuevoSlug = slugify(datosActualizados.nombre, {
        lower: true,
        strict: true,
        replacement: '_',
      });

      await renombrarEstructuraRestaurante(establecimientoActual.nombre, datosActualizados.nombre);
      datosActualizados.slug = nuevoSlug;
    }

    // Luego continúa con la actualización en la base de datos
    const campos = [];
    const valores = [];

    for (const [clave, valor] of Object.entries(datosActualizados)) {
      campos.push(`${clave} = ?`);
      valores.push(valor);
    }

    valores.push(id);

    const sql = `UPDATE establecimientos SET ${campos.join(', ')} WHERE id = ?`;
    await db.query(sql, valores);

    return { id, ...datosActualizados };
  } catch (err) {
    console.error('Error al actualizar el establecimiento:', err);
    throw new Error('No se pudo actualizar el establecimiento');
  }
};

// Elimina un establecimiento por ID
const eliminarEstablecimiento = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM establecimientos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Establecimiento no encontrado');
    }
    return true; // Retorna true si el establecimiento fue eliminado correctamente
  } catch (err) {
    console.error('Error al eliminar el establecimiento:', err);
    throw new Error('No se pudo eliminar el establecimiento');
  }
};

module.exports = {
  listarEstablecimientos,
  crearEstablecimiento,
  obtenerEstablecimientoPorId,
  actualizarEstablecimiento,
  eliminarEstablecimiento
};
