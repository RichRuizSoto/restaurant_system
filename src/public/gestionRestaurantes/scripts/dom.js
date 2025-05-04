import { mostrarModalEditar } from './modalEditar.js';

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
      <p>Estado: ${estado} - Creado el: ${new Date(creado_en).toLocaleString()}</p>
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
