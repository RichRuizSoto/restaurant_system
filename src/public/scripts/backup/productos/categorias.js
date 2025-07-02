// categorias.js
import { fetchJSON } from './api.js';
import { mostrarMensaje } from './ui.js';

const categorias = {};

export async function cargarCategorias() {
  try {
    const data = await fetchJSON('/api/categorias');
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="">Seleccione una categoría</option>';

    data.forEach(cat => {
      categorias[cat.id] = cat.nombre;
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarMensaje('Error al cargar categorías', 'error');
  }
}

export function getNombreCategoria(id) {
  return categorias[id] || 'Desconocida';
}
