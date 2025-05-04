import { mostrarModalEditar } from './modalEditar.js';

export const $form = document.getElementById('formCrearEstablecimiento');
export const $nombreInput = document.getElementById('nombre');
export const $estadoInput = document.getElementById('estado');
export const $lista = document.getElementById('establecimientos-lista');

export function renderizarLista(establecimientos) {
  const fragmento = document.createDocumentFragment();
  $lista.innerHTML = '';

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

  $lista.appendChild(fragmento);
}

export function llenarSelectRestaurantes(restaurantes) {
  const restauranteSelect = document.getElementById('restaurante');
  restauranteSelect.innerHTML = '';

  restaurantes.forEach(rest => {
    const option = document.createElement('option');
    option.value = rest.id;
    option.textContent = rest.nombre;
    restauranteSelect.appendChild(option);
  });
}
