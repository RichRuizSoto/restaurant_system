import { obtenerEstablecimientos, crearEstablecimiento, actualizarEstablecimiento } from './api.js';
import { renderizarLista } from './ui.js';
import { mostrarModalEditar, configurarEnvio } from './modal.js';
import { mostrarToast } from './toast.js';
import { configurarBuscador } from './search.js';
import { configurarSocket } from './socket.js';

const $form = document.getElementById('formCrearEstablecimiento');
const $nombreInput = document.getElementById('nombre');
const $estadoInput = document.getElementById('estado');
const $buscador = document.getElementById('buscador');

let establecimientosOriginales = [];

async function cargarEstablecimientos() {
  try {
    const data = await obtenerEstablecimientos();
    establecimientosOriginales = data;
    renderizarLista(data, mostrarModalEditar);
  } catch (err) {
    console.error('Error al cargar establecimientos:', err);
  }
}

$form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = $nombreInput.value.trim();
  const estado = $estadoInput.value;
  if (!nombre) return alert('Nombre requerido');

  const res = await crearEstablecimiento({ nombre, estado });
  if (res.error) {
    alert(`❌ ${res.error}`);
  } else {
    alert('Establecimiento creado ✅');
    $form.reset();
    cargarEstablecimientos();
  }
});

configurarEnvio(async (id, datos) => {
  const res = await actualizarEstablecimiento(id, datos);
  if (res.error) {
    mostrarToast(res.error, 'danger');
  } else {
    mostrarToast('Actualizado correctamente', 'success');
    cargarEstablecimientos();
  }
});

configurarBuscador($buscador, establecimientosOriginales, (filtrados) => {
  renderizarLista(filtrados, mostrarModalEditar);
});

configurarSocket(cargarEstablecimientos);

document.addEventListener('DOMContentLoaded', cargarEstablecimientos);
