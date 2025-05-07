// main.js
import { cargarCategorias } from './categorias.js';
import { obtenerProductos, registrarEventos } from './productos.js';
import { mostrarMensaje } from './ui.js';
import { filtrarProductos } from './utils.js';
import { setIdRestaurante as setIdRestauranteProductos } from './productos.js';
import { setIdRestaurante as setIdRestauranteEmpleados, registrarEventosEmpleado } from './formEmpleados.js';
import { cargarGananciasPorDia } from './charts.js';


(async function init() {
  const slug = window.location.pathname.split('/')[2];

  try {
    const res = await fetch(`/api/restaurantes/${slug}`);
    const data = await res.json();
    setIdRestauranteProductos(data.id);
    setIdRestauranteEmpleados(data.id);

    document.getElementById('id_restaurante').value = data.id;

    await cargarCategorias();
    await obtenerProductos();
    await cargarGananciasPorDia(data.id);

    registrarEventos();
    registrarEventosEmpleado(); // empleados
    
  } catch (error) {
    console.error('Error al obtener el restaurante:', error);
    mostrarMensaje('Error al cargar el restaurante', 'error');
  }

  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', filtrarProductos);
  }
})();
