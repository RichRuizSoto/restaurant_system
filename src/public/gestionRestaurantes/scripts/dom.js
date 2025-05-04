import { cargarAdministradores } from './api.js';
import { mostrarModalEditar } from './modalEditar.js';
import { mostrarToast } from './notificaciones.js'; // Asegúrate de importar esto correctamente

export const $form = document.getElementById('formCrearEstablecimiento');
export const $nombreInput = document.getElementById('nombre');
export const $estadoInput = document.getElementById('estado');
export const $lista = document.getElementById('establecimientos-lista');

// Función para renderizar la lista de establecimientos
export function renderizarLista(establecimientos) {
  const fragmento = document.createDocumentFragment();
  $lista.innerHTML = '';  // Limpiar la lista antes de renderizarla

  // Verificamos si no hay establecimientos y mostramos un mensaje
  if (establecimientos.length === 0) {
    $lista.innerHTML = '<li class="list-group-item">No hay establecimientos que coincidan con la búsqueda.</li>';
    return;
  }

  // Si hay establecimientos, los recorremos para renderizarlos
  establecimientos.forEach(({ id, nombre, estado, creado_en }) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
      <h4>${nombre}</h4>
      <p>Estado: ${estado} - Creado el: ${new Date(creado_en).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })} ${new Date(creado_en).toLocaleTimeString('es-ES')}</p>
    `;

    const btnGroup = document.createElement('div');
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-warning';
    btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
    btnEditar.addEventListener('click', () => mostrarModalEditar(id, nombre, estado));

    btnGroup.appendChild(btnEditar);
    li.appendChild(infoDiv);
    li.appendChild(btnGroup);
    fragmento.appendChild(li);
  });

  $lista.appendChild(fragmento);  // Agregamos todos los elementos al contenedor de la lista
}

// Función para llenar el select de restaurantes
export function llenarSelectRestaurantes(restaurantes) {
  const restauranteSelect = document.getElementById('restaurante');
  restauranteSelect.innerHTML = '';  // Limpiamos las opciones del select

  // Agregamos la opción por defecto que indica que el usuario debe elegir un restaurante
  const opcionSeleccionar = document.createElement('option');
  opcionSeleccionar.value = '';
  opcionSeleccionar.disabled = true;
  opcionSeleccionar.selected = true;
  opcionSeleccionar.textContent = 'Selecciona un restaurante';
  restauranteSelect.appendChild(opcionSeleccionar);

  // Verificamos si no hay restaurantes disponibles
  if (restaurantes.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'No hay restaurantes disponibles';
    option.disabled = true;
    restauranteSelect.appendChild(option);
    return;
  }

  // Si hay restaurantes, los agregamos como opciones en el select
  restaurantes.forEach(rest => {
    const option = document.createElement('option');
    option.value = rest.id;
    option.textContent = rest.nombre;
    restauranteSelect.appendChild(option);
  });
}

export function renderizarAdministradores(administradores) {
  const listaAdministradores = document.getElementById('lista-administradores');
  listaAdministradores.innerHTML = '';  // Limpiar cualquier contenido previo

  if (administradores.length === 0) {
    listaAdministradores.innerHTML = '<li class="list-group-item">No hay administradores registrados.</li>';
    return;
  }

  administradores.forEach(({ id, nombre, rol, creado_en, id_restaurante, nombre_restaurante }) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
      <h5>${nombre}</h5>
      <p>Rol: ${rol} - Creado el: ${new Date(creado_en).toLocaleString()}</p>
      <p>Restaurante: ${nombre_restaurante}</p> <!-- Mostrar el nombre del restaurante -->
    `;

    // Botón de editar
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-warning';
    btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
    btnEditar.addEventListener('click', () => {
      mostrarFormularioEditarAdmin(id, nombre, rol, id_restaurante, nombre_restaurante);
    });

    // Botón de eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-danger';
    btnEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
    btnEliminar.addEventListener('click', () => {
      eliminarAdministrador(id);
    });

    // Contenedor de los botones
    const btnGroup = document.createElement('div');
    btnGroup.appendChild(btnEditar);
    btnGroup.appendChild(btnEliminar);

    li.appendChild(infoDiv);
    li.appendChild(btnGroup);
    listaAdministradores.appendChild(li);
  });
}


export function mostrarFormularioEditarAdmin(id, nombre, rol, id_restaurante, nombre_restaurante) {
  // Mostrar el modal de edición de administrador
  const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarAdmin'));
  modalEditar.show();

  // Llenar los campos del formulario con la información actual
  document.getElementById('admin-id').value = id;
  document.getElementById('admin-nombre').value = nombre;
  document.getElementById('admin-clave').value = ''; // Limpiar el campo de clave en caso de no querer cambiarla

  // Mostrar el nombre del restaurante en un lugar destacado
  const restauranteInfo = document.getElementById('restaurante-info');
  restauranteInfo.innerHTML = `Restaurante Actual: ${nombre_restaurante}`; // Mostrar el restaurante actual

  // Llenar el select de restaurantes con los restaurantes disponibles
  cargarRestaurantesParaEditar(id_restaurante); // Llamar a la función para llenar el select de restaurantes
}


export async function cargarRestaurantesParaEditar() {
  try {
    const res = await fetch('/api/gestor/establecimientos');
    if (!res.ok) throw new Error('Error al obtener restaurantes');

    const restaurantes = await res.json();

    // Llenar el select de restaurantes en el modal
    const selectRestaurante = document.getElementById('admin-restaurante');
    selectRestaurante.innerHTML = ''; // Limpiar el select

    restaurantes.forEach((restaurante) => {
      const option = document.createElement('option');
      option.value = restaurante.id;
      option.textContent = restaurante.nombre;
      selectRestaurante.appendChild(option);
    });
  } catch (err) {
    console.error('Error al cargar restaurantes', err);
  }
}

document.getElementById('formEditarAdministrador').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

  const id = document.getElementById('admin-id').value;
  const nombre = document.getElementById('admin-nombre').value;
  const clave = document.getElementById('admin-clave').value; // Si no se ingresa una nueva contraseña, no la actualizamos
  const id_restaurante = document.getElementById('admin-restaurante').value;

  // Creamos un objeto con los datos a actualizar
 // Creamos un objeto con los datos a actualizar
const datos = {
  nombreAdmin: nombre,
  restauranteId: id_restaurante,
  ...(clave && { claveAdmin: clave })
};

try {
  const res = await fetch(`/api/usuarios/administradores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });

  const data = await res.json(); // Obtener la respuesta como JSON

  if (res.ok) {
    // Mostrar un toast de éxito si la actualización fue exitosa
    mostrarToast(data.message, 'success');
    cargarAdministradores(); // Recargar la lista de administradores
    const modalEditar = bootstrap.Modal.getInstance(document.getElementById('modalEditarAdmin'));
    modalEditar.hide(); // Cerrar el modal
  } else {
    // Mostrar un toast de error si la respuesta contiene un error
    mostrarToast(data.error || 'Error al actualizar el administrador', 'danger');
  }
} catch (err) {
  console.error('Error al actualizar administrador', err);
  mostrarToast('Error de conexión al actualizar el administrador', 'danger');
}
});
