// usuariosService.js
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
        const administradores = await Usuarios.mostrarAdministradores();
        return administradores; // Retorna la lista de administradores
    } catch (err) {
        throw new Error(err.message);
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
