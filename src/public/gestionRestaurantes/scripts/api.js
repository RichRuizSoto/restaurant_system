import { renderizarLista, llenarSelectRestaurantes } from './dom.js';

export async function cargarEstablecimientos() {
  try {
    const res = await fetch('/api/usuarios/establecimientos');
    if (!res.ok) throw new Error('Error al obtener establecimientos');

    const data = await res.json();
    renderizarLista(data);
  } catch (err) {
    console.error('[Frontend] Error al cargar establecimientos:', err);
  }
}

export async function cargarRestaurantes() {
  try {
    const res = await fetch('/api/usuarios/establecimientos');
    if (!res.ok) throw new Error('Error al obtener restaurantes');

    const restaurantes = await res.json();
    llenarSelectRestaurantes(restaurantes);
  } catch (err) {
    console.error('[Frontend] Error al cargar restaurantes:', err);
  }
}
