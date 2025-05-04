import { cargarEstablecimientos, cargarRestaurantes } from './api.js';
import { inicializarEventos } from './eventos.js';
import './sockets.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarEstablecimientos();
  cargarRestaurantes();
  inicializarEventos();
});
