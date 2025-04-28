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
      // Actualizar el estado del pedido en la base de datos
      await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, idPedido]);

      // Obtener los productos asociados al pedido
      const productos = await obtenerProductosDePedido(idPedido);

      // Emitir el evento a todos los clientes con el nuevo estado y los productos
      io.emit('estadoPedidoActualizado', {
        idPedido,
        nuevoEstado,
        productos: productos.map(prod => ({
          id_producto: prod.id_producto,
          cantidad: prod.cantidad,
          precio_unitario: prod.precio_unitario
        })),
      });
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
