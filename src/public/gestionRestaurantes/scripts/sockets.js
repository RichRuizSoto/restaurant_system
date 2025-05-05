import { cargarEstablecimientos, cargarAdministradores } from './api.js';

export const socket = io(); // <-- Asegúrate de exportarlo así

socket.on('actualizarEstablecimientos', () => {
  console.log('[Socket.IO] Evento recibido');
  cargarEstablecimientos();
});

socket.on('actualizarAdministradores', () => {
  console.log('[Socket.IO] actualizarAdministradores recibido');
  cargarAdministradores();
});