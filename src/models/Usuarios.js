// modals/Usuarios.js
const db = require('../core/config/database');

// Función para crear un administrador
exports.crearAdministrador = async (nombreAdmin, claveAdmin, restauranteId) => {
  if (!nombreAdmin || !claveAdmin || !restauranteId) {
    throw new Error('Todos los campos son obligatorios.');
  }

  try {
    const query = `
      INSERT INTO usuarios (id_restaurante, nombre, rol, clave)
      VALUES (?, ?, 'admin', ?)
    `;
    const [result] = await db.execute(query, [restauranteId, nombreAdmin, claveAdmin]);

    return result; // Retorna el resultado de la inserción
  } catch (err) {
    console.error('[Backend] Error al crear el administrador:', err);
    throw new Error('Error inesperado al crear el administrador');
  }
};

// Función para obtener todos los administradores
exports.mostrarAdministradores = async () => {
  try {
    const query = `SELECT * FROM usuarios WHERE rol = 'admin'`;
    const [administradores] = await db.execute(query);
    return administradores; // Devolver los administradores
  } catch (err) {
    console.error('[Backend] Error al obtener administradores:', err);
    throw new Error('Error inesperado al obtener administradores');
  }
};

// Función para obtener un solo administrador por su ID
exports.mostrarAdministrador = async (id) => {
  try {
    const query = `SELECT * FROM usuarios WHERE id = ?`;
    const [admin] = await db.execute(query, [id]);
    
    if (admin.length === 0) {
      throw new Error('Administrador no encontrado');
    }

    return admin[0]; // Devolver el administrador encontrado
  } catch (err) {
    console.error('[Backend] Error al obtener administrador:', err);
    throw new Error('Error inesperado al obtener administrador');
  }
};

// Función para actualizar la información de un administrador
exports.editarInformacionAdministrador = async (id, nombreAdmin, claveAdmin, restauranteId) => {
  try {
    const query = `
      UPDATE usuarios 
      SET nombre = ?, clave = ?, id_restaurante = ? 
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [nombreAdmin, claveAdmin, restauranteId, id]);

    if (result.affectedRows === 0) {
      throw new Error('Administrador no encontrado');
    }

    return result; // Retorna el resultado de la actualización
  } catch (err) {
    console.error('[Backend] Error al actualizar administrador:', err);
    throw new Error('Error inesperado al actualizar administrador');
  }
};

// Función para eliminar un administrador
exports.eliminarAdministrador = async (id) => {
  try {
    const query = `DELETE FROM usuarios WHERE id = ?`;
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Administrador no encontrado');
    }

    return result; // Retorna el resultado de la eliminación
  } catch (err) {
    console.error('[Backend] Error al eliminar administrador:', err);
    throw new Error('Error inesperado al eliminar administrador');
  }
};
