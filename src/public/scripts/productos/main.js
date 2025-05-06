// main.js
import { cargarCategorias } from './categorias.js';
import { obtenerProductos, setIdRestaurante, registrarEventos } from './productos.js';
import { mostrarMensaje } from './ui.js';
import { filtrarProductos } from './utils.js';

(async function init() {
  const slug = window.location.pathname.split('/')[2];

  try {
    const res = await fetch(`/api/restaurantes/${slug}`);
    const data = await res.json();
    setIdRestaurante(data.id);

    document.getElementById('id_restaurante').value = data.id;

    await cargarCategorias();
    await obtenerProductos();
    registrarEventos();
  } catch (error) {
    console.error('Error al obtener el restaurante:', error);
    mostrarMensaje('Error al cargar el restaurante', 'error');
  }

  // ✅ Conectar el campo de búsqueda con el filtro
  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', filtrarProductos);
  }
})();
