import { fetchJSON } from './api.js';
import { mostrarMensaje } from './ui.js';

let idRestaurante = null;

// Esta función debe ser llamada para establecer el id del restaurante
export function setIdRestaurante(id) {
  idRestaurante = id;
}

// Función para validar la clave del empleado
function validarClave(clave) {
  // Al menos 8 caracteres y debe incluir letras y números
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(clave);
}

// Registrar eventos para el formulario de agregar empleado
export async function registrarEventosEmpleado() {
  // Obtenemos el formulario de agregar empleado
  const form = document.getElementById('formEmpleado');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar el comportamiento por defecto del formulario (recargar la página)
    
    // Obtenemos los datos del formulario
    const data = {
        nombreEmpleado: form.nombre.value.trim(),
        claveEmpleado: form.clave.value.trim(),
        restauranteId: idRestaurante,
      };

    // Verificar que todos los campos obligatorios estén completos
    if (!data.nombreEmpleado || !data.claveEmpleado) {
      mostrarMensaje('Por favor, complete todos los campos.', 'error');
      return;
    }

    // Validar la clave del empleado
    if (!validarClave(data.claveEmpleado)) {
      mostrarMensaje('La clave debe tener al menos 8 caracteres y contener una mezcla de letras y números.', 'error');
      return;
    }

    try {
      // Llamamos a la API para agregar el empleado
      const result = await fetchJSON('/api/usuarios/crearEmpleado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // Mostrar mensaje de éxito
      mostrarMensaje(result.mensaje || 'Empleado agregado exitosamente', 'success');

      // Limpiar el formulario después de agregar
      form.reset();

    } catch (error) {
      // Manejo de errores
      const mensajes = Array.isArray(error.error) ? error.error.join(' | ') : (error.error || 'Error general');
      mostrarMensaje(mensajes, 'error');
    }
  });
}
