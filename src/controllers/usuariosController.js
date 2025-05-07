// usuariosController.js
const usuariosService = require('../services/usuariosService'); // Importar el servicio

// Función para crear un administrador
exports.crearAdministrador = async (req, res) => {
  const { nombreAdmin, claveAdmin, restauranteId } = req.body;

  try {
    const result = await usuariosService.crearAdministrador(nombreAdmin, claveAdmin, restauranteId);
    res.status(201).json(result); // Devolver mensaje de éxito
  } catch (err) {
    console.error('[Backend] Error al crear el administrador:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Función para mostrar todos los administradores
exports.mostrarAdministradores = async (req, res) => {
  try {
    const administradores = await usuariosService.mostrarAdministradores();
    res.status(200).json(administradores); // Devolver lista de administradores
  } catch (err) {
    console.error('[Backend] Error al obtener administradores:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Función para mostrar un administrador específico
exports.mostrarAdministrador = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await usuariosService.mostrarAdministrador(id);
    res.status(200).json(admin); // Devolver el administrador encontrado
  } catch (err) {
    console.error('[Backend] Error al obtener administrador:', err.message);
    if (err.message === 'Administrador no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Función para editar la información de un administrador
exports.editarInformacionAdministrador = async (req, res) => {
  const { id } = req.params;
  const { nombreAdmin, claveAdmin, restauranteId } = req.body;

  if (!nombreAdmin || !restauranteId) {
    return res.status(400).json({ error: 'Nombre y restaurante son obligatorios.' });
  }

  try {
    const result = await usuariosService.editarInformacionAdministrador(id, nombreAdmin, claveAdmin, restauranteId);
    res.status(200).json(result); // Mensaje de éxito
  } catch (err) {
    console.error('[Backend] Error al actualizar administrador:', err.message);
    if (err.message === 'Administrador no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Función para eliminar un administrador
exports.eliminarAdministrador = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await usuariosService.eliminarAdministrador(id);
    res.status(200).json(result); // Mensaje de éxito
  } catch (err) {
    console.error('[Backend] Error al eliminar administrador:', err.message);
    if (err.message === 'Administrador no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Función para crear un empleado
exports.crearEmpleado = async (req, res) => {
  const { nombreEmpleado, claveEmpleado, restauranteId } = req.body;

  try {
    const result = await usuariosService.crearEmpleado(nombreEmpleado, claveEmpleado, restauranteId);
    res.status(201).json(result); // Devolver mensaje de éxito
  } catch (err) {
    console.error('[Backend] Error al crear el empleado:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Función para mostrar todos los empleados
exports.mostrarEmpleados = async (req, res) => {
  try {
    const empleados = await usuariosService.mostrarEmpleados();
    res.status(200).json(empleados); // Devolver lista de empleados
  } catch (err) {
    console.error('[Backend] Error al obtener empleados:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Función para mostrar un empleado específico
exports.mostrarEmpleado = async (req, res) => {
  const { id } = req.params;

  try {
    const empleado = await usuariosService.mostrarEmpleado(id);
    res.status(200).json(empleado); // Devolver el empleado encontrado
  } catch (err) {
    console.error('[Backend] Error al obtener empleado:', err.message);
    if (err.message === 'Empleado no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Función para editar la información de un empleado
exports.editarInformacionEmpleado = async (req, res) => {
  const { id } = req.params;
  const { nombreEmpleado, claveEmpleado, restauranteId } = req.body;

  if (!nombreEmpleado || !restauranteId) {
    return res.status(400).json({ error: 'Nombre y restaurante son obligatorios.' });
  }

  try {
    const result = await usuariosService.editarInformacionEmpleado(id, nombreEmpleado, claveEmpleado, restauranteId);
    res.status(200).json(result); // Mensaje de éxito
  } catch (err) {
    console.error('[Backend] Error al actualizar empleado:', err.message);
    if (err.message === 'Empleado no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Función para eliminar un empleado
exports.eliminarEmpleado = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await usuariosService.eliminarEmpleado(id);
    res.status(200).json(result); // Mensaje de éxito
  } catch (err) {
    console.error('[Backend] Error al eliminar empleado:', err.message);
    if (err.message === 'Empleado no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};
