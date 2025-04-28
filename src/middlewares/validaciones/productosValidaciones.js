// src/middlewares/validaciones/productosValidator.js

const validaciones = require('./validacionesService');

// ✅ Validar campos requeridos al crear un producto
exports.validarProductoCreacion = (req, res, next) => {
  const { id_restaurante, nombre_producto, precio, categoria } = req.body;

  if (!id_restaurante || !nombre_producto || !precio || !categoria) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: id_restaurante, nombre_producto, precio, categoria'
    });
  }

  if (typeof nombre_producto !== 'string') {
    return res.status(400).json({ error: 'El nombre del producto debe ser texto' });
  }

  if (isNaN(precio) || Number(precio) <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número válido mayor a cero' });
  }

  next();
};

// ✅ Validar que el campo "disponible" sea booleano o 0/1
exports.validarDisponibilidad = (req, res, next) => {
  const { disponible } = req.body;

  if (
    'disponible' in req.body &&
    typeof disponible !== 'boolean' &&
    disponible !== 0 &&
    disponible !== 1
  ) {
    return res.status(400).json({
      error: 'El campo "disponible" debe ser booleano (true/false) o numérico (0/1)'
    });
  }

  next();
};

// ✅ Validar que haya al menos un campo para actualizar
exports.validarDatosActualizacion = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
  }
  next();
};

// ✅ Validar que el restaurante existe en la base de datos
exports.validarExistenciaRestaurante = async (req, res, next) => {
  const id_restaurante = req.body.id_restaurante || req.params.restId;
  console.log('🧪 Validando existencia de restaurante con ID:', id_restaurante);

  try {
    const existe = await validaciones.restauranteExiste(id_restaurante);
    console.log('✔️ Restaurante existe:', existe);

    if (!existe) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    next();
  } catch (error) {
    console.error('❌ Error en validación de restaurante:', error);
    res.status(500).json({ error: 'Error validando restaurante' });
  }
};

// ✅ Validar que el producto existe dentro del restaurante
exports.validarExistenciaProducto = async (req, res, next) => {
  const { id, restId } = req.params;
  console.log(`🔍 Validando existencia del producto ${id} en restaurante ${restId}`);

  try {
    const existe = await validaciones.productoExisteEnRestaurante(id, restId);
    console.log('✔️ Producto existe en restaurante:', existe);

    if (!existe) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    next();
  } catch (error) {
    console.error('❌ Error en validación de producto:', error);
    res.status(500).json({ error: 'Error validando producto' });
  }
};
