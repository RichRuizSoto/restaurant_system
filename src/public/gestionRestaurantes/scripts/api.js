import { renderizarLista, llenarSelectRestaurantes } from './dom.js';

// Suponiendo que esta función está en api.js o un archivo similar.
export async function cargarEstablecimientos(query = '') {
  try {
    const res = await fetch(`/api/gestor/establecimientos?search=${query}`);
    const establecimientos = await res.json();

    if (res.ok) {
      // Filtra los establecimientos según el texto de búsqueda
      const establecimientosFiltrados = establecimientos.filter(establecimiento => {
        const nombreLower = establecimiento.nombre.toLowerCase();
        const estadoLower = establecimiento.estado.toLowerCase();
        return nombreLower.includes(query) || estadoLower.includes(query);
      });

      // Llama a la función renderizada para mostrar los resultados filtrados
      renderizarLista(establecimientosFiltrados);
    } else {
      console.error('Error al cargar los establecimientos');
    }
  } catch (err) {
    console.error('Error de conexión o al obtener establecimientos', err);
  }
}


export async function cargarRestaurantes() {
  try {
    const res = await fetch('/api/gestor/establecimientos');
    if (!res.ok) throw new Error('Error al obtener restaurantes');

    const restaurantes = await res.json();
    llenarSelectRestaurantes(restaurantes);
  } catch (err) {
    console.error('[Frontend] Error al cargar restaurantes:', err);
  }
}
