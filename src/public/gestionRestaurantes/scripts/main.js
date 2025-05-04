import { cargarEstablecimientos, cargarRestaurantes, cargarAdministradores} from './api.js';
import { inicializarEventos } from './eventos.js';
import './sockets.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarEstablecimientos();
  cargarRestaurantes();
  cargarAdministradores();     // Cargar administradores
  inicializarEventos();
});
