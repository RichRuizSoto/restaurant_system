const { Server } = require('socket.io');
const db = require('../core/config/database');  // Asegúrate de importar tu archivo de conexión a la base de datos

let io;

// Función para obtener los productos de un pedido
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

    socket.on('restauranteCreado', () => {
      io.emit('actualizarEstablecimientos');
    });

    socket.on('administradorActualizado', () => {
      io.emit('actualizarAdministradores');
    });
    

    // Evento para actualizar el estado de un pedido
    socket.on('actualizarEstadoPedido', async (idPedido, nuevoEstado) => {
      try {
        // Validación de la entrada
        if (isNaN(idPedido) || idPedido <= 0) {
          console.warn(`⚠️ idPedido inválido: ${idPedido}`);
          socket.emit('error', { mensaje: 'ID de pedido inválido' });
          return;
        }

        // Validar que el nuevo estado sea uno de los valores permitidos
        const estadosValidos = ['pendiente', 'en_proceso', 'finalizado']; // Asegúrate de que estos estados coincidan con tu lógica
        if (!estadosValidos.includes(nuevoEstado)) {
          console.warn(`⚠️ nuevoEstado inválido: ${nuevoEstado}`);
          socket.emit('error', { mensaje: 'Estado inválido' });
          return;
        }

        // Usar una transacción para garantizar la consistencia de los datos
        const connection = await db.getConnection(); // Obtener una conexión de la base de datos
        await connection.beginTransaction(); // Iniciar la transacción

        // Comprobar si el pedido existe
        const [pedidoResult] = await connection.query('SELECT * FROM pedidos WHERE id = ?', [idPedido]);
        if (pedidoResult.length === 0) {
          console.warn(`⚠️ Pedido con ID ${idPedido} no encontrado`);
          await connection.rollback(); // Revertir la transacción si el pedido no existe
          socket.emit('error', { mensaje: 'Pedido no encontrado' });
          return;
        }

        // Actualizar el estado del pedido
        const [updateResult] = await connection.query('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, idPedido]);

        // Si no se actualizó nada, no emitir el evento
        if (updateResult.affectedRows === 0) {
          console.warn(`⚠️ No se actualizó el estado del pedido con ID ${idPedido}`);
          await connection.rollback(); // Revertir la transacción si no se actualizó el estado
          socket.emit('error', { mensaje: 'No se pudo actualizar el estado del pedido' });
          return;
        }

        // Obtener los productos del pedido
        const productos = await obtenerProductosDePedido(idPedido);

        // Obtener los datos básicos del pedido (número de orden, mesa, total, etc.)
        const [[pedido]] = await connection.query('SELECT numero_orden, mesa, total, creado_en FROM pedidos WHERE id = ?', [idPedido]);

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
            precio_unitario: prod.precio_unitario,
            nombre: prod.nombre // asegúrate de incluir esto
          }))
        });

        // Confirmar la transacción
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
