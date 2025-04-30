const pedidosService = require('../services/pedidosService');
const restaurantesService = require('../services/restaurantesService');
const { getSocket } = require('../utils/socket');

const ESTADOS_VALIDOS = ['solicitado', 'listo', 'pagado'];

// 🟢 Crear nuevo pedido
exports.recibirPedido = async (req, res) => {
  try {
    const pedido = req.body;

    // Validación de estructura básica del pedido
    if (
      !pedido.id_restaurante ||
      typeof pedido.total !== 'number' ||
      !Array.isArray(pedido.productos) ||
      pedido.productos.length === 0
    ) {
      return res.status(400).json({ mensaje: 'Pedido inválido: faltan datos requeridos' });
    }

    // Validar los productos
    for (const prod of pedido.productos) {
      if (
        !prod.id_producto ||
        typeof prod.cantidad !== 'number' ||
        typeof prod.precio !== 'number'
      ) {
        return res.status(400).json({ mensaje: 'Producto inválido en el pedido' });
      }
    }

// 1. Crear el pedido
const nuevoPedido = await pedidosService.crearPedido(pedido);

// 2. Obtener los productos del pedido si aún no están incluidos
//const productos = await pedidosService.obtenerProductosPorPedido(nuevoPedido.id);

// 3. Emitir evento con estructura completa esperada por el frontend
const io = getSocket();
console.log('📡 Emitiendo nuevoPedido con datos completos:', nuevoPedido);

io.emit('nuevoPedido', nuevoPedido);
    
    res.status(201).json({ 
      pedido: nuevoPedido,
      numero_orden: nuevoPedido.numero_orden // ✅ Añadido explícitamente
    });
    

  } catch (err) {
    console.error('❌ [Error en recibirPedido]', err);
    res.status(500).json({
      mensaje: 'Error al procesar el pedido',
      detalle: err.message
    });
  }
};


// 🔍 Obtener pedido por número de orden
exports.obtenerPedidoPorNumero = async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    if (isNaN(numero)) return res.status(400).json({ mensaje: 'Número de orden inválido' });

    const pedido = await pedidosService.obtenerPedidoPorNumero(numero);
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });

    res.json({ pedido });
  } catch (err) {
    console.error('❌ [Error en obtenerPedidoPorNumero]', err);
    res.status(500).json({ mensaje: 'Error al obtener el pedido' });
  }
};

// 🔍 Ver pedido por ID
exports.verPedido = async (req, res) => {
  try {
    const idPedido = parseInt(req.params.id, 10);
    if (isNaN(idPedido)) return res.status(400).json({ mensaje: 'ID de pedido inválido' });

    const pedido = await pedidosService.obtenerPedidoPorId(idPedido);
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });

    res.json({ pedido });
  } catch (err) {
    console.error('❌ [Error en verPedido]', err);
    res.status(500).json({ mensaje: 'Error al obtener el pedido' });
  }
};

// 📋 Pedidos por estado
exports.obtenerPedidosPorEstado = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.obtenerPedidosPorRestaurante(req.params.restId);

    const agrupados = {
      solicitado: [],
      listo: [],
      pagado: []
    };

    for (const pedido of pedidos) {
      if (agrupados[pedido.estado]) {
        agrupados[pedido.estado].push(pedido);
      }
    }

    for (const estado of Object.keys(agrupados)) {
      agrupados[estado].sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
    }

    res.json(agrupados);
  } catch (error) {
    console.error('❌ [Error en obtenerPedidosPorEstado]', error);
    next(error);
  }
};

// 🔁 Actualizar estado de pedido
exports.actualizarEstadoPedido = async (req, res, next) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  try {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    const pedidoActualizado = await pedidosService.cambiarEstadoPedido(id, nuevoEstado);
    if (!pedidoActualizado) return res.status(404).json({ mensaje: 'Pedido no encontrado' });

    const io = getSocket();
    io.emit('estadoPedidoActualizado', {
      idPedido: id,
      nuevoEstado,
      numero_orden: pedidoActualizado.numero_orden,
      mesa: pedidoActualizado.mesa,
      productos: pedidoActualizado.productos,
      total: pedidoActualizado.total,
      creado_en: pedidoActualizado.creado_en,
      estado: nuevoEstado,
    });

    res.json({
      mensaje: `Pedido actualizado a "${nuevoEstado}"`,
      pedido: pedidoActualizado
    });
  } catch (error) {
    console.error('❌ [Error en actualizarEstadoPedido]', error);
    next(error);
  }
};

// 🖥️ Renderizar pedidos en vista EJS
exports.renderizarVistaPedidos = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const restaurante = await restaurantesService.obtenerRestaurantePorSlug(slug);
    if (!restaurante) return res.status(404).json({ mensaje: 'Restaurante no encontrado' });

    const restId = restaurante.id;
    const pedidos = await pedidosService.obtenerPedidosPorRestaurante(restId);

    const agrupados = {
      solicitado: [],
      listo: [],
      pagado: []
    };

    // 🟢 Agregar productos a cada pedido
    for (const pedido of pedidos) {
      const productos = await pedidosService.obtenerProductosPorPedido(pedido.id);
      pedido.productos = productos;

      if (agrupados[pedido.estado]) {
        agrupados[pedido.estado].push(pedido);
      }
    }

    // Ordenar pedidos por fecha
    for (const estado of Object.keys(agrupados)) {
      agrupados[estado].sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
    }

    res.render('pedidos', { pedidos: agrupados, restId, slug });
  } catch (error) {
    console.error('❌ [Error en renderizarVistaPedidos]', error);
    next(error);
  }
};
