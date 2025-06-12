const { Server } = require('socket.io');
const db = require('../core/config/database');  // Conexión a la base de datos
const pedidosService = require('../services/pedidosService'); // asegúrate de importar

let io;

// Obtener productos del pedido
async function obtenerProductosDePedido(idPedido) {
  const [productos] = await db.query(`
    SELECT dp.id_producto, dp.cantidad, dp.precio_unitario, p.nombre 
    FROM detalle_pedido dp
    JOIN productos p ON dp.id_producto = p.id
    WHERE dp.id_pedido = ?
  `, [idPedido]);
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

    // Cliente se une a su restaurante
    socket.on('unirseARestaurante', (restauranteId) => {
      if (!restauranteId) return;
      socket.join(`restaurante_${restauranteId}`);
      console.log(`📡 Cliente unido a sala restaurante_${restauranteId}`);
    });




    // Cliente se une a su sala exclusiva
    socket.on('unirseASalaExclusiva', (restauranteId, pedidoId) => {
      if (!restauranteId || !pedidoId) return;
      socket.join(`sala_${restauranteId}_${pedidoId}`);
      console.log(`👤 Cliente unido a sala ${restauranteId}_${pedidoId}`);
    });




    socket.on('restauranteCreado', () => {
      io.emit('actualizarEstablecimientos');
    });

    socket.on('administradorActualizado', () => {
      io.emit('actualizarAdministradores');
    });

    // 🧾 Estado de pedido actualizado
    socket.on('actualizarEstadoPedido', async (idPedido, nuevoEstado) => {
      try {
        if (isNaN(idPedido) || idPedido <= 0) {
          console.warn(`⚠️ idPedido inválido: ${idPedido}`);
          socket.emit('error', { mensaje: 'ID de pedido inválido' });
          return;
        }

        const estadosValidos = ['pendiente', 'en_proceso', 'finalizado'];
        if (!estadosValidos.includes(nuevoEstado)) {
          console.warn(`⚠️ Estado inválido: ${nuevoEstado}`);
          socket.emit('error', { mensaje: 'Estado inválido' });
          return;
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        const [pedidoResult] = await connection.query('SELECT * FROM pedidos WHERE id = ?', [idPedido]);
        if (pedidoResult.length === 0) {
          await connection.rollback();
          socket.emit('error', { mensaje: 'Pedido no encontrado' });
          return;
        }

        const [updateResult] = await connection.query(
          'UPDATE pedidos SET estado = ? WHERE id = ?',
          [nuevoEstado, idPedido]
        );

        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          socket.emit('error', { mensaje: 'No se pudo actualizar el estado del pedido' });
          return;
        }

        const productos = await obtenerProductosDePedido(idPedido);

        const [[pedido]] = await connection.query(
          'SELECT numero_orden, mesa, total, creado_en, id_restaurante FROM pedidos WHERE id = ?',
          [idPedido]
        );

        io.to(`restaurante_${pedido.id_restaurante}`).emit('estadoPedidoActualizado', {
          idPedido,
          nuevoEstado,
          numero_orden: pedido.numero_orden,
          mesa: pedido.mesa,
          total: pedido.total,
          creado_en: pedido.creado_en,
          productos: productos.map(prod => ({
            id_producto: prod.id_producto,
            cantidad: prod.cantidad,
            precio_unitario: prod.precio_unitario,
            nombre: prod.nombre
          }))
        });

        await connection.commit();
      } catch (err) {
        console.error('❌ [Error en socket.actualizarEstadoPedido]', err);
        socket.emit('error', { mensaje: 'Hubo un error al actualizar el estado del pedido. Intenta nuevamente.' });
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
