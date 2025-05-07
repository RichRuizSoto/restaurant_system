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

// Función para actualizar la información de un administrador (con clave opcional)
exports.editarInformacionAdministrador = async (id, nombreAdmin, claveAdmin, restauranteId) => {
    try {
      let query;
      let params;
  
      if (claveAdmin && claveAdmin.trim() !== '') {
        // Si se proporciona una nueva clave, la incluimos en la actualización
        query = `
          UPDATE usuarios 
          SET nombre = ?, clave = ?, id_restaurante = ? 
          WHERE id = ?
        `;
        params = [nombreAdmin, claveAdmin, restauranteId, id];
      } else {
        // Si no se proporciona clave, no la actualizamos
        query = `
          UPDATE usuarios 
          SET nombre = ?, id_restaurante = ? 
          WHERE id = ?
        `;
        params = [nombreAdmin, restauranteId, id];
      }
  
      const [result] = await db.execute(query, params);
  
      if (result.affectedRows === 0) {
        throw new Error('Administrador no encontrado');
      }
  
      return result;
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


// Función para crear un empleado
exports.crearEmpleado = async (nombreEmpleado, claveEmpleado, restauranteId) => {
  if (!nombreEmpleado || !claveEmpleado || !restauranteId) {
    throw new Error('Todos los campos son obligatorios.');
  }

  try {
    const query = `
      INSERT INTO usuarios (id_restaurante, nombre, rol, clave)
      VALUES (?, ?, 'empleado', ?)
    `;
    const [result] = await db.execute(query, [restauranteId, nombreEmpleado, claveEmpleado]);

    return result; // Retorna el resultado de la inserción
  } catch (err) {
    console.error('[Backend] Error al crear el empleado:', err);
    throw new Error('Error inesperado al crear el empleado');
  }
};

// Función para obtener todos los empleados
exports.mostrarEmpleados = async () => {
  try {
    const query = `SELECT * FROM usuarios WHERE rol = 'empleado'`;
    const [empleados] = await db.execute(query);
    return empleados; // Devolver los empleados
  } catch (err) {
    console.error('[Backend] Error al obtener empleados:', err);
    throw new Error('Error inesperado al obtener empleados');
  }
};

// Función para obtener un solo empleado por su ID
exports.mostrarEmpleado = async (id) => {
  try {
    const query = `SELECT * FROM usuarios WHERE id = ?`;
    const [empleado] = await db.execute(query, [id]);
    
    if (empleado.length === 0) {
      throw new Error('Empleado no encontrado');
    }

    return empleado[0]; // Devolver el empleado encontrado
  } catch (err) {
    console.error('[Backend] Error al obtener empleado:', err);
    throw new Error('Error inesperado al obtener empleado');
  }
};

// Función para actualizar la información de un empleado (con clave opcional)
exports.editarInformacionEmpleado = async (id, nombreEmpleado, claveEmpleado, restauranteId) => {
    try {
      let query;
      let params;
  
      if (claveEmpleado && claveEmpleado.trim() !== '') {
        // Si se proporciona una nueva clave, la incluimos en la actualización
        query = `
          UPDATE usuarios 
          SET nombre = ?, clave = ?, id_restaurante = ? 
          WHERE id = ?
        `;
        params = [nombreEmpleado, claveEmpleado, restauranteId, id];
      } else {
        // Si no se proporciona clave, no la actualizamos
        query = `
          UPDATE usuarios 
          SET nombre = ?, id_restaurante = ? 
          WHERE id = ?
        `;
        params = [nombreEmpleado, restauranteId, id];
      }
  
      const [result] = await db.execute(query, params);
  
      if (result.affectedRows === 0) {
        throw new Error('Empleado no encontrado');
      }
  
      return result;
    } catch (err) {
      console.error('[Backend] Error al actualizar empleado:', err);
      throw new Error('Error inesperado al actualizar empleado');
    }
};

// Función para eliminar un empleado
exports.eliminarEmpleado = async (id) => {
  try {
    const query = `DELETE FROM usuarios WHERE id = ?`;
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Empleado no encontrado');
    }

    return result; // Retorna el resultado de la eliminación
  } catch (err) {
    console.error('[Backend] Error al eliminar empleado:', err);
    throw new Error('Error inesperado al eliminar empleado');
  }
};