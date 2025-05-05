import { cargarEstablecimientos } from './api.js';
import { mostrarToast } from './notificaciones.js';

const $formEditar = document.getElementById('formEditarEstablecimiento');
const $editarNombreInput = document.getElementById('editar-nombre');
const $editarEstadoInput = document.getElementById('editar-estado');
const modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));

let idActualEditar = null;
let nombreOriginal = '';
let estadoOriginal = '';

export function mostrarModalEditar(id, nombre, estado) {
  idActualEditar = id;
  nombreOriginal = nombre.trim();
  estadoOriginal = estado.toLowerCase();

  $editarNombreInput.value = nombreOriginal;
  $editarEstadoInput.value = estadoOriginal;
  modalEditar.show();

  setTimeout(() => {
    $editarNombreInput.focus();
  }, 100);
}

$formEditar.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nombre = $editarNombreInput.value.trim();
  const estado = $editarEstadoInput.value;

  if (!nombre || !estado) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  if (nombre === nombreOriginal && estado === estadoOriginal) {
    mostrarToast('No se realizaron cambios', 'info');
    modalEditar.hide();
    return;
  }
nombre
  try {
    const res = await fetch(`/api/gestor/establecimientos/${idActualEditar}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, estado })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || 'Error al actualizar');
      return;
    }

    mostrarToast('Establecimiento actualizado con éxito', 'success');
    modalEditar.hide();
    cargarEstablecimientos();
  } catch (err) {
    console.error('[Frontend] Error al actualizar:', err);
    alert('Error inesperado al actualizar el establecimiento');
  }
});
