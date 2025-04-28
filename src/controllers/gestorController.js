const gestorService = require('../services/gestorService'); 
const { crearEstructuraRestaurante, eliminarEstructuraRestaurante } = require('../utils/restauranteFileManager');

// Crear un establecimiento
const crearRestaurante = async (req, res) => {
  const { nombre, estado = 'activo' } = req.body;

  // Verificar que el nombre sea una cadena no vacía
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre del establecimiento no es válido' });
  }

  try {
    const nuevoEstablecimiento = await gestorService.crearEstablecimiento(nombre, estado);
    return res.status(201).json(nuevoEstablecimiento); // Devolvemos el establecimiento recién creado
  } catch (error) {
    console.error('Error creando establecimiento:', error);
    // Aquí manejamos el caso de que el restaurante ya exista
    if (error.message === 'Ya existe un restaurante con ese nombre') {
      return res.status(400).json({ error: 'Ya existe un restaurante con ese nombre' });
    }
    return res.status(500).json({ error: 'No se pudo crear el establecimiento' });
  }
};



// Obtener todos los establecimientos
const listarEstablecimientos = async (req, res) => {
  try {
    const establecimientos = await gestorService.listarEstablecimientos();
    res.status(200).json(establecimientos);
  } catch (error) {
    console.error('Error al obtener los establecimientos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los establecimientos' });
  }
};

// Obtener un establecimiento por ID
const obtenerEstablecimientoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const establecimiento = await gestorService.obtenerEstablecimientoPorId(id);
    if (!establecimiento) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }
    res.status(200).json(establecimiento);
  } catch (error) {
    console.error('Error al obtener el establecimiento:', error);
    res.status(500).json({ error: 'No se pudo obtener el establecimiento' });
  }
};

// Actualizar un establecimiento
const actualizarEstablecimiento = async (req, res) => {
  const { id } = req.params;
  const datosActualizados = req.body;

  try {
    const establecimientoActualizado = await gestorService.actualizarEstablecimiento(id, datosActualizados);
    res.status(200).json(establecimientoActualizado);
  } catch (error) {
    console.error('Error al actualizar el establecimiento:', error);
    res.status(500).json({ error: 'No se pudo actualizar el establecimiento' });
  }
};

const eliminarEstablecimiento = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el restaurante existe
    const establecimiento = await gestorService.obtenerEstablecimientoPorId(id);
    if (!establecimiento) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    // Verificar si existen productos asociados al restaurante
    const productos = await gestorService.obtenerProductosPorRestaurante(id);
    if (productos.length > 0) {
      // Eliminar los productos asociados antes de eliminar el restaurante
      await gestorService.eliminarProductosPorRestaurante(id);
    }

    // Eliminar la estructura de archivos del restaurante
    try {
      await eliminarEstructuraRestaurante(establecimiento.nombre);
    } catch (err) {
      console.error('⚠️ No se pudo eliminar la estructura de archivos del restaurante:', err.message);
      // No es crítico, pero podrías querer manejar el error si es necesario
    }

    // Eliminar el establecimiento de la base de datos
    const resultado = await gestorService.eliminarEstablecimiento(id);
    if (resultado) {
      res.status(200).json({ message: 'Establecimiento eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Establecimiento no encontrado en la base de datos' });
    }
  } catch (error) {
    console.error('Error al eliminar el establecimiento:', error);
    res.status(500).json({ error: 'No se pudo eliminar el establecimiento' });
  }
};



module.exports = {
  crearRestaurante,
  listarEstablecimientos,
  obtenerEstablecimientoPorId,
  actualizarEstablecimiento,
  eliminarEstablecimiento
};