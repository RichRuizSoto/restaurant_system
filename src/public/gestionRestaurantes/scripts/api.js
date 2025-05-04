// api.js
import { renderizarLista, llenarSelectRestaurantes, renderizarAdministradores } from './dom.js';  // Asegúrate de importar también renderizarAdministradores

// Función para cargar establecimientos, con búsqueda opcional
export async function cargarEstablecimientos(query = '') {
  try {
    const res = await fetch(`/api/gestor/establecimientos?search=${query}`);
    const establecimientos = await res.json();

    if (res.ok) {
      // Filt           ra los establecimientos según el texto de búsqueda
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

// Función para cargar los restaurantes y llenar el select
export async function cargarRestaurantes() {
  try {
    const res = await fetch('/api/gestor/establecimientos');
    if (!res.ok) throw new Error('Error al obtener restaurantes');

    const restaurantes = await res.json();
    llenarSelectRestaurantes(restaurantes);  // Llenamos el select con los restaurantes
  } catch (err) {
    console.error('[Frontend] Error al cargar restaurantes:', err);
  }
}

// Función para cargar administradores
export async function cargarAdministradores() {
  try {
    const res = await fetch('/api/usuarios/administradores');
    if (!res.ok) throw new Error('Error al obtener administradores');

    const administradores = await res.json();
    // Llama a la función que renderiza los administradores en el DOM
    renderizarAdministradores(administradores);
  } catch (err) {
    console.error('[Frontend] Error al cargar administradores:', err);
  }
}
