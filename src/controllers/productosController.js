const productosService = require('../services/productosService');
const restauranteService = require('../services/restaurantesService');

// 🟢 Crear producto
exports.agregarProducto = async (req, res, next) => {
  try {
    console.log('🟢 Iniciando creación de producto...');
    const { id_restaurante, nombre_producto, descripcion, precio, categoria } = req.body;

    if (!id_restaurante || !nombre_producto || !precio || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: id_restaurante, nombre_producto, precio, categoria' });
    }

    const nuevoProducto = await productosService.crearProducto(req.body);
    console.log('✅ Producto creado:', nuevoProducto);

    res.status(201).json({
      mensaje: 'Producto agregado con éxito',
      producto: nuevoProducto
    });
  } catch (error) {
    console.error('❌ Error al agregar producto:', error);
    next(error);
  }
};

// 📦 Obtener productos (validado por middleware)
exports.obtenerProductos = async (req, res, next) => {
  const { restId } = req.params;

  try {
    const productos = await productosService.obtenerProductosPorRestaurante(restId);
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron productos para este restaurante.' });
    }

    res.json(productos);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    next(error);
  }
};

// 🔍 Obtener producto por ID
exports.obtenerProductoPorId = async (req, res, next) => {
  const { id } = req.params;

  try {
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    res.json(producto);
  } catch (error) {
    console.error('❌ Error al obtener producto por ID:', error);
    next(error);
  }
};

// ✏️ Actualizar un producto
exports.actualizarProducto = async (req, res, next) => {
  const { id } = req.params;
  const { restId } = req.params;
  const data = req.body;

  try {
    const actualizado = await productosService.actualizarProducto(id, data);
    const productosActivos = await productosService.obtenerProductosActivos(restId);

    const cantidadProductosAct = productosActivos.length;

    const io = req.app.get('io');
    io.to(`restaurante_${restId}`).emit('productosActivos', cantidadProductosAct);

    res.json({
      mensaje: 'Producto actualizado',
      producto: actualizado
    });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    next(error);
  }
};

// 🗑️ Eliminar un producto
exports.eliminarProducto = async (req, res, next) => {
  const { id } = req.params;

  try {
    await productosService.eliminarProducto(id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    next(error);
  }
};

// 🗑️ Eliminar todos los productos de un restaurante
exports.eliminarProductosPorRestaurante = async (req, res, next) => {
  const { idRestaurante } = req.params;

  try {
    await productosService.eliminarProductosPorRestaurante(idRestaurante);
    res.json({ mensaje: 'Todos los productos han sido eliminados para este restaurante.' });
  } catch (error) {
    console.error('❌ Error al eliminar productos:', error);
    next(error);
  }
};


// 📦 Obtener productos desde API (para frontend)
exports.obtenerProductosPorRestaurante = async (req, res, next) => {
  const { idRestaurante } = req.params;

  try {
    // Verifica si el restaurante existe por ID
    const restaurante = await restauranteService.obtenerRestaurantePorId(idRestaurante);

    if (!restaurante) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado.' });
    }

    // Obtener productos del restaurante
    const productos = await productosService.obtenerProductosPorRestaurante(idRestaurante);

    if (!productos || productos.length === 0) {
      return res.status(200).json([]);  // No hay productos pero el restaurante existe
    }

    // Si todo es correcto, enviar productos
    res.json(productos);
  } catch (error) {
    console.error('[obtenerProductosPorRestaurante] ❌ Error:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ✅ Contar productos activos
exports.contarProductosActivos = async (req, res, next) => {
  const { idRestaurante } = req.params;

  try {
    const productos = await productosService.obtenerProductosPorRestaurante(idRestaurante);
    const activos = productos.filter(p => p.disponible === 1).length;
    res.json({ productosActivos: activos });
  } catch (error) {
    console.error('❌ Error al contar productos activos:', error);
    res.status(500).json({ error: 'Error al contar productos activos' });
  }
};
