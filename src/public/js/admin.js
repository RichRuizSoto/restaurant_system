let idRestaurante = null;

async function init() {
  const slug = window.location.pathname.split('/')[2];
  try {
    const res = await fetch(`/api/restaurantes/restaurantes/${slug}`);
    const data = await res.json();
    idRestaurante = data.id;

    // Realizar tareas administrativas específicas
  } catch (error) {
    mostrarMensaje('Error al cargar el restaurante', 'error');
  }
}

function mostrarMensaje(msg, tipo = 'success') {
  const div = document.getElementById('mensaje');
  div.textContent = msg;
  div.style.color = tipo === 'error' ? 'red' : 'green';
  setTimeout(() => div.textContent = '', 3000);
}

init();
