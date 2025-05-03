const $editarNombreInput = document.getElementById('editar-nombre');
const $editarEstadoInput = document.getElementById('editar-estado');
const $formEditar = document.getElementById('formEditarEstablecimiento');
const modal = new bootstrap.Modal(document.getElementById('modalEditar'));

let idActualEditar = null;
let valoresOriginales = {};

export function mostrarModalEditar(id, nombre, estado) {
  idActualEditar = id;
  valoresOriginales = { nombre: nombre.trim(), estado: estado.toLowerCase() };

  $editarNombreInput.value = valoresOriginales.nombre;
  $editarEstadoInput.value = valoresOriginales.estado;
  modal.show();

  setTimeout(() => $editarNombreInput.focus(), 100);
}

export function configurarEnvio(onGuardar) {
  $formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = $editarNombreInput.value.trim();
    const estado = $editarEstadoInput.value;

    if (!nombre || !estado) return alert('Todos los campos son obligatorios.');

    if (nombre === valoresOriginales.nombre && estado === valoresOriginales.estado) {
      onGuardar('No se realizaron cambios', 'info');
      modal.hide();
      return;
    }

    await onGuardar(idActualEditar, { nombre, estado });
    modal.hide();
  });
}
