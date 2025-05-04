import { $form, $nombreInput, $estadoInput } from './dom.js';
import { cargarEstablecimientos, cargarRestaurantes } from './api.js';

export function inicializarEventos() {
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
        alert(`❌ No se pudo crear:\n${data.error}`);
        return;
      }

      alert('Establecimiento creado 🎉');
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
      alert('Todos los campos son obligatorios.');
      return;
    }

    try {
      const res = await fetch('/api/gestor/crearAdministrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreAdmin, claveAdmin, restauranteId })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ No se pudo crear el administrador:\n${data.error}`);
        return;
      }

      alert('Administrador creado con éxito 🎉');
      formAdmin.reset();
    } catch (err) {
      console.error('[Frontend] Error al crear administrador:', err);
      alert('Error inesperado al crear el administrador');
    }
  });
}
