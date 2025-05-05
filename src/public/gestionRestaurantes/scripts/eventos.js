import { $form, $nombreInput, $estadoInput } from './dom.js';
import { cargarEstablecimientos, cargarRestaurantes } from './api.js';
import { mostrarToast } from './notificaciones.js';
import { cargarAdministradores } from './api.js';

export function inicializarEventos() {
  // Evento para crear un nuevo establecimiento
  $form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = $nombreInput.value.trim();
    const estado = $estadoInput.value;

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    try {
      const res = await fetch('/api/gestor/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, estado })
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast(`❌ No se pudo crear: ${data.error}`, 'danger');
        return;
      }

      mostrarToast('Establecimiento creado 🎉', 'success');
      $form.reset();
      cargarEstablecimientos();
    } catch (err) {
      console.error('[Frontend] Error al crear:', err);
      alert('Error inesperado');
    }
  });

  // Evento para formulario de crear administrador
const formAdmin = document.getElementById('formCrearAdministrador');
formAdmin.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nombreAdmin = document.getElementById('nombre-admin').value.trim();
  const claveAdmin = document.getElementById('clave-admin').value;
  const restauranteId = document.getElementById('restaurante').value;

  if (!nombreAdmin || !claveAdmin || !restauranteId) {
    mostrarToast('Todos los campos son obligatorios.', 'danger'); // Notificación de error
    return;
  }

  try {
    const res = await fetch('/api/usuarios/crearAdministrador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreAdmin, claveAdmin, restauranteId })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarToast(`No se pudo crear el administrador:\n${data.error}`, 'danger'); // Notificación de error
      return;
    }

    // Aquí es donde se muestra el mensaje de éxito con la notificación
    mostrarToast('Administrador creado con éxito', 'success'); // Notificación de éxito
    formAdmin.reset();  // Limpiar el formulario después de la creación
  } catch (err) {
    console.error('[Frontend] Error al crear administrador:', err);
    mostrarToast('Error inesperado al crear el administrador', 'danger'); // Notificación de error
  }
});

  // Evento para el campo de búsqueda de establecimientos
  const inputBusqueda = document.getElementById('buscador'); // Capturamos el input de búsqueda
  inputBusqueda.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    cargarEstablecimientos(query);  // Pasamos el valor del buscador a la función de carga
  });
}

// Función para eliminar un administrador
let idAdministradorAEliminar = null;

const $modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
const $btnConfirmar = document.getElementById('btnConfirmarEliminar');

// Esta función se llama cuando se hace clic en el botón eliminar
export function eliminarAdministrador(id) {
  idAdministradorAEliminar = id;
  $modal.show();
}

// Evento para confirmar eliminación
$btnConfirmar.addEventListener('click', async () => {
  if (!idAdministradorAEliminar) return;

  try {
    const res = await fetch(`/api/usuarios/administradores/${idAdministradorAEliminar}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (res.ok) {
      mostrarToast(data.message || 'Administrador eliminado exitosamente', 'success');
      cargarAdministradores(); // Recargar lista
    } else {
      mostrarToast(data.error || 'Error al eliminar el administrador', 'danger');
    }
  } catch (err) {
    console.error('Error al eliminar administrador:', err);
    mostrarToast('Error de conexión al eliminar administrador', 'danger');
  }

  idAdministradorAEliminar = null;
  $modal.hide(); // Cierra el modal después de eliminar
});