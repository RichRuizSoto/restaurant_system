import { cargarEstablecimientos } from './api.js';

const socket = io();

socket.on('actualizarEstablecimientos', () => {
  console.log('[Socket.IO] Evento recibido');
  cargarEstablecimientos();
});
