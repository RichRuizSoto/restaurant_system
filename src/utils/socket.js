const { Server } = require('socket.io');
const db = require('../core/config/database');  // Asegúrate de importar tu archivo de conexión a la base de datos

let io;

// Función para obtener los productos de un pedido
async function obtenerProductosDePedido(idPedido) {
  const [productos] = await db.query('SELECT * FROM detalle_pedido WHERE id_pedido = ?', [idPedido]);
  return productos;
}

function setupSocket(server, app) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado a WebSocket');

    socket.emit('actualizarEstablecimientos');

    socket.on('restauranteCreado', () => {
      io.emit('actualizarEstablecimientos');
    });

    // Evento para actualizar el estado de un pedido
    socket.on('actualizarEstadoPedido', async (idPedido, nuevoEstado) => {
      try {
        // Comprobar si el pedido existe
        const [pedidoResult] = await db.query('SELECT * FROM pedidos WHERE id = ?', [idPedido]);
        if (pedidoResult.length === 0) {
          console.warn(`⚠️ Pedido con ID ${idPedido} no encontrado`);
          return;
        }

        // Actualizar el estado del pedido
        const [updateResult] = await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, idPedido]);

        // Si no se actualizó nada, no emitir el evento
        if (updateResult.affectedRows === 0) {
          console.warn(`⚠️ No se actualizó el estado del pedido con ID ${idPedido}`);
          return;
        }

        // Obtener los productos del pedido
        const productos = await obtenerProductosDePedido(idPedido);

        // Obtener los datos básicos del pedido (número de orden, mesa, total, etc.)
        const [[pedido]] = await db.query('SELECT numero_orden, mesa, total, creado_en FROM pedidos WHERE id = ?', [idPedido]);

        // Emitir el evento con la información actualizada
        io.emit('estadoPedidoActualizado', {
          idPedido,
          nuevoEstado,
          numero_orden: pedido.numero_orden,
          mesa: pedido.mesa,
          total: pedido.total,
          creado_en: pedido.creado_en,
          productos: productos.map(prod => ({
            id_producto: prod.id_producto,
            cantidad: prod.cantidad,
            precio_unitario: prod.precio_unitario
          }))
        });
      } catch (err) {
        console.error('❌ [Error en socket.actualizarEstadoPedido]', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado de WebSocket');
    });
  });
}

function getSocket() {
  return io;
}

module.exports = {
  setupSocket,
  getSocket
};
