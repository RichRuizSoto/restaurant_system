const db = require('../core/config/database'); // O la conexión que uses para tu base de datos

// 🟢 Crear nueva categoría
exports.crearCategoria = async (nombre_categoria) => {
  try {
    const [result] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre_categoria]);
    return {
      id: result.insertId,
      nombre: nombre_categoria
    };
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    throw error;
  }
};

// 📦 Obtener todas las categorías
exports.obtenerCategorias = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias');
    return rows;
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    throw error;
  }
};

// 🔍 Obtener una categoría específica por ID
exports.obtenerCategoriaPorId = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return null; // Si no se encuentra la categoría
    }

    return rows[0]; // Retorna la categoría encontrada
  } catch (error) {
    console.error('❌ Error al obtener categoría por ID:', error);
    throw error;
  }
};

// 🔄 Actualizar una categoría
exports.actualizarCategoria = async (id, nombre_categoria) => {
  try {
    const [result] = await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre_categoria, id]);

    if (result.affectedRows === 0) {
      return null; // Si no se encontró la categoría, devolver null
    }

    return {
      id: id,
      nombre: nombre_categoria
    };
  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
    throw error;
  }
};

// 🗑️ Eliminar una categoría
exports.eliminarCategoria = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return null; // Si no se encontró la categoría, devolver null
    }

    return {
      id: id
    };
  } catch (error) {
    console.error('❌ Error al eliminar categoría:', error);
    throw error;
  }
};
