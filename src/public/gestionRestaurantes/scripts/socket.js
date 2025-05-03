export function configurarSocket(callback) {
    const socket = io();
    socket.on('actualizarEstablecimientos', () => {
      console.log('[Socket.IO] Actualización recibida');
      callback();
    });
  }
  