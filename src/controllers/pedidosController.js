const pedidosService = require('../services/pedidosService');
const restaurantesService = require('../services/restaurantesService');
const socket = require('../utils/socket'); // Asegúrate de importar el socket
const gananciasService = require('../services/gananciasService');

const ESTADOS_VALIDOS = ['solicitado', 'listo', 'pagado', 'cancelado'];
const TIPOS_SERVICIO_VALIDOS = ['restaurante', 'delivery', 'pickup'];

// 🟢 Crear nuevo pedido
exports.recibirPedido = async (req, res) => {
  try {
    const pedido = req.body;

    if (
      !pedido.id_restaurante ||
      typeof pedido.total !== 'number' ||
      !Array.isArray(pedido.productos) ||
      pedido.productos.length === 0 ||
      !TIPOS_SERVICIO_VALIDOS.includes(pedido.tipo_servicio)
    ) {
      return res.status(400).json({ mensaje: 'Pedido inválido: faltan datos requeridos' });
    }

    for (const prod of pedido.productos) {
      if (
        !prod.id_producto ||
        typeof prod.cantidad !== 'number' ||
        typeof prod.precio !== 'number'
      ) {
        return res.status(400).json({ mensaje: 'Producto inválido en el pedido' });
      }
    }

    const nuevoPedido = await pedidosService.crearPedido(pedido);
    const productosDB = await pedidosService.obtenerProductosPorPedido(nuevoPedido.id);
    const promedio = await pedidosService.obtenerPromedioUltimos10(pedido.id_restaurante);

    const productos = productosDB.map(p => ({
      id_producto: p.id_producto,
      cantidad: p.cantidad,
      precio_unitario: parseFloat(p.precio_unitario),
      nombre: p.nombre || p.nombre_producto || `Producto ${p.id_producto}`
    }));

    nuevoPedido.productos = productos;

    const io = req.app.get('io');
    console.log('📡 Emitiendo nuevoPedido con datos completos:', nuevoPedido);
    io.to(`restaurante_${nuevoPedido.id_restaurante}`).emit('nuevoPedido', nuevoPedido);

    res.status(201).json({
      data: nuevoPedido,
      numero_orden: nuevoPedido.numero_orden,
      promedio
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
      pagado: [],
      cancelado: []
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
  const { nuevoEstado} = req.body;
  const { restauranteId } = req.body;
  const io = req.app.get('io');


  try {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    const pedidoActualizado = await pedidosService.cambiarEstadoPedido(id, nuevoEstado);
    if (!pedidoActualizado) return res.status(404).json({ mensaje: 'Pedido no encontrado' });


    // Obtener productos con nombre para el evento WebSocket
    const productos = await pedidosService.obtenerProductosPorPedido(pedidoActualizado.id);

    io.to(`restaurante_${pedidoActualizado.id_restaurante}`).emit('estadoPedidoActualizado', {
      idPedido: pedidoActualizado.id,
      nuevoEstado: pedidoActualizado.estado,
      numero_orden: pedidoActualizado.numero_orden,
      mesa: pedidoActualizado.mesa,
      total: pedidoActualizado.total,
      creado_en: pedidoActualizado.creado_en,
      productos: productos.map(prod => ({
        id_producto: prod.id_producto,
        cantidad: prod.cantidad,
        precio_unitario: prod.precio_unitario,
        nombre: prod.nombre
      }))
    });

    //Uso de WebSocket para segun estado
    const ingresosHoy = await gananciasService.obtenerIngresosHoy(restauranteId);
    const lista = await pedidosService.obtenerUltimosPedidos(restauranteId);

    if (nuevoEstado === 'listo') {
      io.to(`sala_${restauranteId}_${id}`).emit('nuevoEstadoPedido', nuevoEstado);
      io.to(`restaurante_${restauranteId}`).emit('cambioEstado', lista);
    } 
    if (nuevoEstado === 'pagado') {
      io.to(`restaurante_${restauranteId}`).emit('ingresosHoy', ingresosHoy);
      io.to(`restaurante_${restauranteId}`).emit('cambioEstado', lista);
    }
    if (nuevoEstado === 'cancelado') {
      io.to(`restaurante_${restauranteId}`).emit('cambioEstado', lista);
    }
    
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
      pagado: [],
      cancelado: []
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

// 📅 Obtener cantidad de pedidos de hoy
exports.obtenerCantidadPedidosHoy = async (req, res) => {
  try {
    const idRestaurante = req.params.restId;

    const cantidad = await pedidosService.obtenerCantidadPedidosHoy(idRestaurante);
    res.json({ pedidosHoy: cantidad });
  } catch (error) {
    console.error('❌ [Error en obtenerCantidadPedidosHoy]', error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos del día' });
  }
};


exports.obtenerUltimosPedidos = async (req, res) => {
  try {
    const idRestaurante = req.params.restId;
    const ultimos = await pedidosService.obtenerUltimosPedidos(idRestaurante); // lo agregas al service
    res.json(ultimos);
  } catch (err) {
    console.error('❌ [Error en obtenerUltimosPedidos]', err);
    res.status(500).json({ mensaje: 'Error al obtener últimos pedidos' });
  }
};
