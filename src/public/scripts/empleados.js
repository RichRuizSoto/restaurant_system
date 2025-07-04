async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

function mostrarMensaje(msg, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

let idRestauranteEmpleado = null;

function setIdRestauranteEmpleados(id) {
  idRestauranteEmpleado = id;
}

async function registrarEventosEmpleado() {
  const form = document.getElementById('formEmpleado');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombreEmpleado: form.nombre.value.trim(),
      claveEmpleado: form.clave.value.trim(),
      restauranteId: idRestauranteEmpleado,
    };

    if (!data.nombreEmpleado || !data.claveEmpleado) {
      return mostrarMensaje('Por favor, complete todos los campos.', 'error');
    }

    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regex.test(data.claveEmpleado)) {
      return mostrarMensaje('La clave debe tener al menos 8 caracteres con letras y números.', 'error');
    }

    try {
      const result = await fetchJSON('/api/usuarios/crearEmpleado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      mostrarMensaje(result.mensaje || 'Empleado agregado exitosamente', 'success');
      form.reset();
    } catch (error) {
      const mensajes = Array.isArray(error.error) ? error.error.join(' | ') : (error.error || 'Error general');
      mostrarMensaje(mensajes, 'error');
    }
  });
}

(async function initEmpleado() {
  const slug = window.location.pathname.split('/')[2];
  try {
    const res = await fetch(`/api/restaurantes/${slug}`);
    const data = await res.json();
    setIdRestauranteEmpleados(data.id);
    registrarEventosEmpleado();
  } catch {
    mostrarMensaje('Error al obtener restaurante', 'error');
  }
})();
