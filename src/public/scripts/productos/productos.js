// productos.js
import { fetchJSON } from './api.js';
import { mostrarMensaje, mostrarNotificacion } from './ui.js';
import { obtenerClaseCategoria } from './utils.js';
import { getNombreCategoria, cargarCategorias } from './categorias.js';

let idRestaurante = null;
let productoEnEdicion = null;

export function setIdRestaurante(id) {
  idRestaurante = id;
}

export async function obtenerProductos() {
  if (!idRestaurante) return;

  try {
    const productos = await fetchJSON(`/api/productos/${idRestaurante}`);
    const tbody = document.querySelector('#tablaProductos tbody');
    tbody.innerHTML = '';

    productos.forEach(p => {
      const precio = parseFloat(p.precio);
      const categoriaNombre = getNombreCategoria(p.categoria);
      tbody.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td>${p.nombre_producto}</td>
            <td>${p.descripcion || ''}</td>
            <td>$${precio.toFixed(2)}</td>
            <td><span class="${obtenerClaseCategoria(categoriaNombre)}">${categoriaNombre}</span></td>
            <td>${p.disponible ? 'Sí' : 'No'}</td>
            <td>
              <button onclick="cargarProducto(${p.id})">Editar</button>
              <button onclick="toggleDisponibilidad(${p.id}, ${p.disponible})" data-estado="${p.disponible ? 'desactivar' : 'activar'}">
                ${p.disponible ? 'Desactivar' : 'Activar'}
              </button>
            </td>
          </tr>
        `;
    });
  } catch (err) {
    console.error('[obtenerProductos] ❌ Error:', err);
    mostrarMensaje('Error al cargar productos', 'error');
  }
}

window.cargarProducto = async function (id) {
  const p = await fetchJSON(`/api/productos/${idRestaurante}/${id}`);
  const form = document.getElementById('formProducto');

  form.nombre_producto.value = p.nombre_producto;
  form.descripcion.value = p.descripcion;
  form.precio.value = p.precio;
  form.categoria.value = p.categoria;

  productoEnEdicion = p.id;

  document.getElementById('btnGuardar').style.display = 'none';
  document.getElementById('btnActualizar').style.display = 'inline-block';
  document.getElementById('btnCancelar').style.display = 'inline-block';
};

window.toggleDisponibilidad = async function (id, estadoActual) {
  const nuevoEstado = estadoActual ? 0 : 1;
  try {
    const data = await fetchJSON(`/api/productos/${idRestaurante}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible: nuevoEstado })
    });

    mostrarNotificacion(data.mensaje || 'Estado actualizado', 'success');
    obtenerProductos();
  } catch (error) {
    console.error(error);
    mostrarNotificacion('Error al actualizar el producto', 'error');
  }
};

export async function registrarEventos() {
  document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      id_restaurante: idRestaurante,
      nombre_producto: form.nombre_producto.value.trim(),
      descripcion: form.descripcion.value.trim(),
      precio: parseFloat(form.precio.value),
      categoria: form.categoria.value
    };

    try {
      const result = await fetchJSON('/api/productos/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      mostrarMensaje(result.mensaje || 'Producto agregado', 'success');
      form.reset();
      obtenerProductos();
    } catch (error) {
      const mensajes = Array.isArray(error.error) ? error.error.join(' | ') : (error.error || 'Error general');
      mostrarMensaje(mensajes, 'error');
    }
  });

  document.getElementById('btnActualizar').addEventListener('click', async () => {
    const form = document.getElementById('formProducto');
    const data = {
      nombre_producto: form.nombre_producto.value.trim(),
      descripcion: form.descripcion.value.trim(),
      precio: parseFloat(form.precio.value),
      disponible: 1,
      categoria: form.categoria.value
    };

    try {
      await fetchJSON(`/api/productos/${idRestaurante}/${productoEnEdicion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      form.reset();
      productoEnEdicion = null;
      document.getElementById('btnGuardar').style.display = 'inline-block';
      document.getElementById('btnActualizar').style.display = 'none';
      document.getElementById('btnCancelar').style.display = 'none';
      obtenerProductos();
    } catch (error) {
      mostrarMensaje("Hubo un error al procesar la solicitud", 'error');
    }
  });

  document.getElementById('btnAgregarCategoria').addEventListener('click', () => {
    document.getElementById('formCategoria').style.display = 'block';
  });

  document.getElementById('btnCancelarCategoria').addEventListener('click', () => {
    document.getElementById('formCategoria').style.display = 'none';
    document.getElementById('nombre_categoria').value = '';
  });

  document.getElementById('btnGuardarCategoria').addEventListener('click', async () => {
    const nombreCategoria = document.getElementById('nombre_categoria').value.trim();

    if (!nombreCategoria) {
      mostrarNotificacion('Por favor, ingresa un nombre para la categoría.', 'error');
      return;
    }

    try {
      const result = await fetchJSON(`/api/categorias/agregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_categoria: nombreCategoria })
      });

      mostrarMensaje(result.mensaje || 'Categoría agregada exitosamente', 'success');
      await cargarCategorias();
      document.getElementById('formCategoria').style.display = 'none';
      document.getElementById('nombre_categoria').value = '';
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      mostrarMensaje('Error al agregar la categoría', 'error');
    }
  });
}
