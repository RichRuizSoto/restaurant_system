const socket = io();

// Elementos del DOM
const $form = document.getElementById('formCrearEstablecimiento');
const $nombreInput = document.getElementById('nombre');
const $estadoInput = document.getElementById('estado');
const $lista = document.getElementById('establecimientos-lista');

// Elementos del modal de edición
const $formEditar = document.getElementById('formEditarEstablecimiento');
const $editarNombreInput = document.getElementById('editar-nombre');
const $editarEstadoInput = document.getElementById('editar-estado');
const modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));
let idActualEditar = null;

// 🔄 Cargar lista desde la API
async function cargarEstablecimientos() {
  try {
    const res = await fetch('/api/gestor/establecimientos');
    if (!res.ok) throw new Error('Error al obtener establecimientos');

    const data = await res.json();
    renderizarLista(data);
  } catch (err) {
    console.error('[Frontend] Error al cargar establecimientos:', err);
  }
}

// 🧱 Renderizar lista en el DOM
function renderizarLista(establecimientos) {
  const fragmento = document.createDocumentFragment();
  $lista.innerHTML = '';

  establecimientos.forEach(({ id, nombre, estado, creado_en }) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'restaurant-info';
    infoDiv.innerHTML = `
      <h4>${nombre}</h4>
      <p>Estado: ${estado} - Creado el: ${new Date(creado_en).toLocaleString()}</p>
    `;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'buttons';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-warning';
    btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
    btnEditar.addEventListener('click', () => mostrarModalEditar(id, nombre, estado));

    btnGroup.appendChild(btnEditar);
    li.appendChild(infoDiv);
    li.appendChild(btnGroup);
    fragmento.appendChild(li);
  });

  $lista.appendChild(fragmento);
}

// 📥 Crear nuevo establecimiento
$form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nombre = $nombreInput.value.trim();
  const estado = $estadoInput.value;

  if (!nombre) {
    alert('El nombre del establecimiento es obligatorio.');
    return;
  }

  try {
    const res = await fetch('/api/gestor/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, estado })
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('[Frontend] No se pudo crear el establecimiento:', data.error);
      alert(`❌ No se pudo crear:\n${data.error}`);
      return;
    }

    alert('Establecimiento creado con éxito 🎉');
    $form.reset();
    cargarEstablecimientos();
  } catch (err) {
    console.error('[Frontend] Error al crear establecimiento:', err);
    alert('Error inesperado al crear el establecimiento');
  }
});

let nombreOriginal = '';
let estadoOriginal = '';

function mostrarModalEditar(id, nombre, estado) {
  idActualEditar = id;
  nombreOriginal = nombre.trim();
  estadoOriginal = estado.toLowerCase();

  $editarNombreInput.value = nombreOriginal;
  $editarEstadoInput.value = estadoOriginal;

  // Mostrar el modal
  modalEditar.show();

  // Establecer el foco en el primer campo de entrada después de abrir el modal
  setTimeout(() => {
    $editarNombreInput.focus();
  }, 100); // Tiempo necesario para asegurar que el modal se haya cargado completamente
}

// 💾 Guardar cambios desde el modal
$formEditar.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nombre = $editarNombreInput.value.trim();
  const estado = $editarEstadoInput.value;

  if (!nombre || !estado) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  // 🛑 Comparar con valores originales
  if (nombre === nombreOriginal && estado === estadoOriginal) {
    mostrarToast('No se realizaron cambios', 'info');
    modalEditar.hide();
    return;
  }

  try {
    const res = await fetch(`/api/gestor/establecimientos/${idActualEditar}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, estado })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || 'Error al actualizar el establecimiento');
      return;
    }

    mostrarToast('Establecimiento actualizado con éxito', 'success');
    modalEditar.hide();
    cargarEstablecimientos();
  } catch (err) {
    console.error('[Frontend] Error al actualizar establecimiento:', err);
    alert('Error inesperado al actualizar el establecimiento');
  }
});

// Mostrar Toast de notificación
function mostrarToast(mensaje, tipo = 'success') {
  const toastEl = document.getElementById('toastNotificacion');
  const toastMensaje = document.getElementById('toastMensaje');

  const iconos = {
    success: '<i class="fas fa-check-circle"></i>',
    danger: '<i class="fas fa-times-circle"></i>',
    warning: '<i class="fas fa-exclamation-circle"></i>',
    info: '<i class="fas fa-info-circle"></i>'
  };

  toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
  toastMensaje.innerHTML = `${iconos[tipo] || ''} ${mensaje}`;

  const toast = new bootstrap.Toast(toastEl, {
    delay: 3000,      // ⏱️ 4 segundos
    autohide: true    // 🔁 Se cierra automáticamente
  });

  toast.show();
}

// 🔌 WebSocket para actualizaciones en tiempo real
socket.on('actualizarEstablecimientos', () => {
  console.log('[Socket.IO] Evento recibido: actualizarEstablecimientos');
  cargarEstablecimientos();
});

// 🚀 Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', cargarEstablecimientos);
