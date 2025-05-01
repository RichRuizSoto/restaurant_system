const socket = io();

// Elementos del DOM
const $form = document.getElementById('formCrearEstablecimiento');
const $nombreInput = document.getElementById('nombre');
const $estadoInput = document.getElementById('estado');
const $lista = document.getElementById('establecimientos-lista');

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
  // Usamos un fragmento de documento para evitar manipular el DOM directamente muchas veces
  const fragmento = document.createDocumentFragment();

  // Limpiamos la lista antes de agregar los elementos
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
    btnEditar.setAttribute('aria-label', 'Editar Establecimiento');
    btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
    btnEditar.addEventListener('click', () => editarEstablecimiento(id));

    btnGroup.appendChild(btnEditar);
    li.appendChild(infoDiv);
    li.appendChild(btnGroup);

    // Agregamos el <li> al fragmento en lugar de al DOM directamente
    fragmento.appendChild(li);
  });

  // Finalmente agregamos todo el contenido de una vez al DOM
  $lista.appendChild(fragmento);
}


// ✅ Evento al enviar el formulario
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
    $form.reset(); // Limpia el formulario
    cargarEstablecimientos(); // Actualiza la lista sin esperar al socket
  } catch (err) {
    console.error('[Frontend] Error al crear establecimiento:', err);
    alert('Error inesperado al crear el establecimiento');
  }
});

// Editar un establecimiento
async function editarEstablecimiento(id) {
  const nombreNuevo = prompt('Nuevo nombre del establecimiento:')?.trim();
  const estadoNuevo = prompt('Nuevo estado del establecimiento (activo/desactivo):')?.trim();

  if (!nombreNuevo || !estadoNuevo) {
    alert('Ambos campos son obligatorios y no pueden estar vacíos.');
    return;
  }

  try {
    const res = await fetch(`/api/gestor/establecimientos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre: nombreNuevo, estado: estadoNuevo })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || 'Error al actualizar el establecimiento');
      return;
    }

    alert('✅ Establecimiento actualizado con éxito');
    cargarEstablecimientos();
  } catch (err) {
    console.error('[Frontend] Error al actualizar establecimiento:', err);
    alert('Error inesperado al actualizar el establecimiento');
  }
}

// 🔌 WebSocket: escuchar evento de actualización
socket.on('actualizarEstablecimientos', () => {
  console.log('[Socket.IO] Evento recibido: actualizarEstablecimientos');
  cargarEstablecimientos();
});

// 🚀 Al cargar la página
document.addEventListener('DOMContentLoaded', cargarEstablecimientos);
