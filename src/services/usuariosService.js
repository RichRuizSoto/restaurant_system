const db = require('../core/config/database');
const Usuarios = require('../models/Usuarios'); // Importar el modelo

// Función para crear un administrador
exports.crearAdministrador = async (nombreAdmin, claveAdmin, restauranteId) => {
    try {
        const result = await Usuarios.crearAdministrador(nombreAdmin, claveAdmin, restauranteId);
        return { message: 'Administrador creado con éxito' };
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
        await Usuarios.editarInformacionAdministrador(id, nombreAdmin, claveAdmin, restauranteId);


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
