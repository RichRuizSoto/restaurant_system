const db = require('../core/config/database');
const Usuarios = require('../models/Usuarios'); // Importar el modelo
const bcrypt = require('bcrypt');

// Función para crear un administrador
exports.crearAdministrador = async (nombreAdmin, claveAdmin, restauranteId) => {
    try {
      // 1. Verificar si ya existe un administrador con ese nombre en el mismo restaurante
      const [duplicados] = await db.query(
        'SELECT id FROM usuarios WHERE nombre = ? AND id_restaurante = ? AND rol = "admin"',
        [nombreAdmin, restauranteId]
      );
      if (duplicados.length > 0) {
        throw new Error('Ya existe un administrador con ese nombre en este restaurante');
      }
  
      // 2. Encriptar la contraseña
      const claveEncriptada = await bcrypt.hash(claveAdmin, 10);
  
      // 3. Insertar el nuevo administrador
      const [result] = await db.query(
        'INSERT INTO usuarios (nombre, clave, rol, id_restaurante) VALUES (?, ?, ?, ?)',
        [nombreAdmin, claveEncriptada, 'admin', restauranteId]
      );
  
      // 4. Devolver información útil
      return {
        insertId: result.insertId,
        nombre: nombreAdmin,
        rol: 'admin',
        id_restaurante: restauranteId,
        message: 'Administrador creado con éxito',
      };
    } catch (err) {
      throw new Error(err.message);
    }
  };
  

// Función para obtener todos los administradores
exports.mostrarAdministradores = async () => {
    try {
      const query = `
        SELECT usuarios.id, usuarios.nombre, usuarios.rol, usuarios.creado_en, usuarios.id_restaurante, establecimientos.nombre AS nombre_restaurante
        FROM usuarios
        JOIN establecimientos ON usuarios.id_restaurante = establecimientos.id
        WHERE usuarios.rol = 'admin'`;
      
      const [administradores] = await db.execute(query);
      return administradores; // Devolver los administradores con el nombre del restaurante
    } catch (err) {
      console.error('[Backend] Error al obtener administradores:', err); // Ver detalles del error aquí
      throw new Error('Error inesperado al obtener administradores');
    }
  };

// Función para obtener un solo administrador por su ID
exports.mostrarAdministrador = async (id) => {
    try {
        const admin = await Usuarios.mostrarAdministrador(id);
        return admin; // Retorna el administrador encontrado
    } catch (err) {
        throw new Error(err.message);
    }
};

// Función para actualizar la información de un administrador
exports.editarInformacionAdministrador = async (id, nombreAdmin, claveAdmin, restauranteId) => {
    try {
      // 1. Verificar existencia del administrador
      const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id = ? AND rol = "admin"', [id]);
      const admin = usuarios[0];
  
      if (!admin) {
        throw new Error('Administrador no encontrado');
      }
  
      // 2. Verificar si ya existe otro administrador con ese nombre en el mismo restaurante
      const [duplicados] = await db.query(
        'SELECT id FROM usuarios WHERE nombre = ? AND id_restaurante = ? AND rol = "admin" AND id != ?',
        [nombreAdmin, restauranteId, id]
      );
      if (duplicados.length > 0) {
        throw new Error('Ya existe un administrador con ese nombre en este restaurante');
      }
  
      // 3. Cifrar nueva clave si se proporciona
      let claveFinal = admin.clave;
      if (claveAdmin && claveAdmin.trim() !== '') {
        claveFinal = await bcrypt.hash(claveAdmin, 10);
      }
  
      // 4. Ejecutar la actualización
      await db.query(
        'UPDATE usuarios SET nombre = ?, clave = ?, id_restaurante = ? WHERE id = ?',
        [nombreAdmin, claveFinal, restauranteId, id]
      );
  
      return { message: 'Administrador actualizado con éxito' };
    } catch (err) {
      throw new Error(err.message);
    }
  };

// Función para eliminar un administrador
exports.eliminarAdministrador = async (id) => {
    try {
        const result = await Usuarios.eliminarAdministrador(id);
        return { message: 'Administrador eliminado con éxito' };
    } catch (err) {
        throw new Error(err.message);
    }
};

// Función para crear un empleado
exports.crearEmpleado = async (nombreEmpleado, claveEmpleado, restauranteId) => {
    try {
      // 1. Verificar si ya existe un empleado con ese nombre en el mismo restaurante
      const [duplicados] = await db.query(
        'SELECT id FROM usuarios WHERE nombre = ? AND id_restaurante = ? AND rol = "empleado"',
        [nombreEmpleado, restauranteId]
      );
      if (duplicados.length > 0) {
        throw new Error('Ya existe un empleado con ese nombre en este restaurante');
      }
  
      // 2. Encriptar la contraseña
      const claveEncriptada = await bcrypt.hash(claveEmpleado, 10);
  
      // 3. Insertar el nuevo empleado
      const [result] = await db.query(
        'INSERT INTO usuarios (nombre, clave, rol, id_restaurante) VALUES (?, ?, ?, ?)',
        [nombreEmpleado, claveEncriptada, 'empleado', restauranteId]
      );
  
      // 4. Devolver información útil
      return {
        insertId: result.insertId,
        nombre: nombreEmpleado,
        rol: 'empleado',
        id_restaurante: restauranteId,
        message: 'Empleado creado con éxito',
      };
    } catch (err) {
      throw new Error(err.message);
    }
  };

// Función para obtener todos los empleados
exports.mostrarEmpleados = async () => {
    try {
      const query = `
        SELECT usuarios.id, usuarios.nombre, usuarios.rol, usuarios.creado_en, usuarios.id_restaurante, establecimientos.nombre AS nombre_restaurante
        FROM usuarios
        JOIN establecimientos ON usuarios.id_restaurante = establecimientos.id
        WHERE usuarios.rol = 'empleado'`;
      
      const [empleados] = await db.execute(query);
      return empleados; // Devolver los empleados con el nombre del restaurante
    } catch (err) {
      console.error('[Backend] Error al obtener empleados:', err); // Ver detalles del error aquí
      throw new Error('Error inesperado al obtener empleados');
    }
  };

// Función para obtener un solo empleado por su ID
exports.mostrarEmpleado = async (id) => {
    try {
        const empleado = await Usuarios.mostrarEmpleado(id);
        return empleado; // Retorna el empleado encontrado
    } catch (err) {
        throw new Error(err.message);
    }
};

// Función para actualizar la información de un empleado
exports.editarInformacionEmpleado = async (id, nombreEmpleado, claveEmpleado, restauranteId) => {
    try {
      // 1. Verificar existencia del empleado
      const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id = ? AND rol = "empleado"', [id]);
      const empleado = usuarios[0];
  
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }
  
      // 2. Verificar si ya existe otro empleado con el mismo nombre en el mismo restaurante
      const [duplicados] = await db.query(
        'SELECT id FROM usuarios WHERE nombre = ? AND id_restaurante = ? AND rol = "empleado" AND id != ?',
        [nombreEmpleado, restauranteId, id]
      );
      if (duplicados.length > 0) {
        throw new Error('Ya existe un empleado con ese nombre en este restaurante');
      }
  
      // 3. Cifrar nueva clave si se proporciona
      let claveFinal = empleado.clave;
      if (claveEmpleado && claveEmpleado.trim() !== '') {
        claveFinal = await bcrypt.hash(claveEmpleado, 10);
      }
  
      // 4. Ejecutar la actualización
      await db.query(
        'UPDATE usuarios SET nombre = ?, clave = ?, id_restaurante = ? WHERE id = ?',
        [nombreEmpleado, claveFinal, restauranteId, id]
      );
  
      return { message: 'Empleado actualizado con éxito' };
    } catch (err) {
      throw new Error(err.message);
    }
  };

// Función para eliminar un empleado
exports.eliminarEmpleado = async (id) => {
    try {
        const result = await Usuarios.eliminarEmpleado(id);
        return { message: 'Empleado eliminado con éxito' };
    } catch (err) {
        throw new Error(err.message);
    }
};

exports.existeUsuario = async (nombre) => {
    const [rows] = await db.query('SELECT id FROM usuarios WHERE nombre = ?', [nombre]);
    return rows.length > 0;
  };
  