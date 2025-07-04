// Funciones reutilizables
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
  const iconClass = tipo === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle';
  toast.innerHTML = `
    <i class="${iconClass}" style="margin-right: 8px;"></i>
    <span>${msg}</span>
    <button class="close-toast" aria-label="Cerrar notificación">
      <i class="fas fa-times"></i>
    </button>
  `;
  toast.querySelector('.close-toast').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function mostrarNotificacion(mensaje, tipo) {
  const toast = document.createElement('div');
  toast.classList.add('toast', tipo);
  toast.textContent = mensaje;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function obtenerClaseCategoria(categoria) {
  switch (categoria) {
    case 'Entradas': return 'badge badge-entrada';
    case 'Menú': return 'badge badge-menu';
    case 'Combos': return 'badge badge-combo';
    case 'Postres': return 'badge badge-postre';
    case 'Bebidas': return 'badge badge-bebida';
    default: return 'badge badge-default';
  }
}

// ---------------------------
// Gestión de Productos
// ---------------------------

let idRestaurante = null;
let productoEnEdicion = null;
const categorias = {};

function setIdRestauranteProductos(id) {
  idRestaurante = id;
}

function getNombreCategoria(id) {
  return categorias[id] || 'Desconocida';
}

async function cargarCategorias() {
  try {
    const data = await fetchJSON('/api/categorias');
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="">Seleccione una categoría</option>';
    data.forEach(cat => {
      categorias[cat.id] = cat.nombre;
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
    copiarOpcionesCategorias();
  } catch (error) {
    mostrarMensaje('Error al cargar categorías', 'error');
  }
}

function copiarOpcionesCategorias() {
  const origen = document.getElementById('categoria');
  const destino = document.getElementById('edit_categoria');
  if (destino) destino.innerHTML = origen.innerHTML;
}

async function obtenerProductos() {
  if (!idRestaurante) return;
  try {
    const productos = await fetchJSON(`/api/productos/${idRestaurante}`);
    const tbody = document.querySelector('#tablaProductos tbody');
    tbody.innerHTML = '';
    productos.forEach(p => {
      const categoriaNombre = getNombreCategoria(p.categoria);
      tbody.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.nombre_producto}</td>
          <td>${p.descripcion || ''}</td>
          <td>₡${parseFloat(p.precio).toFixed(2)}</td>
          <td><span class="${obtenerClaseCategoria(categoriaNombre)}">${categoriaNombre}</span></td>
          <td>${p.disponible ? 'Sí' : 'No'}</td>
          <td>
            <button class="btn-primary" onclick="cargarProducto(${p.id})">Editar</button>
            <button class="${p.disponible ? 'btn-danger' : 'btn-success'}" onclick="toggleDisponibilidad(${p.id}, ${p.disponible})">
              ${p.disponible ? 'Activado' : 'Desactivado'}
            </button>
          </td>
        </tr>`;
    });
  } catch (error) {
    mostrarMensaje('Error al cargar productos', 'error');
  }
}

window.cargarProducto = async function (id) {
  try {
    const p = await fetchJSON(`/api/productos/${idRestaurante}/${id}`);
    productoEnEdicion = p.id;
    document.getElementById('edit_id').value = p.id;
    document.getElementById('edit_nombre_producto').value = p.nombre_producto;
    document.getElementById('edit_descripcion').value = p.descripcion || '';
    document.getElementById('edit_precio').value = p.precio;
    document.getElementById('edit_categoria').value = p.categoria;
    document.getElementById('modalEditarProducto').style.display = 'block';
  } catch {
    mostrarMensaje("Error al cargar el producto", 'error');
  }
};

window.toggleDisponibilidad = async function (id, estadoActual) {
  try {
    await fetchJSON(`/api/productos/${idRestaurante}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible: estadoActual ? 0 : 1 })
    });
    mostrarMensaje('Estado actualizado');
    obtenerProductos();
  } catch {
    mostrarMensaje('Error al actualizar disponibilidad', 'error');
  }
};

function registrarEventos() {
  document.getElementById('formProducto').addEventListener('submit', async e => {
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
      await fetchJSON('/api/productos/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      form.reset();
      mostrarMensaje('Producto agregado');
      obtenerProductos();
    } catch (err) {
      mostrarMensaje(err.error || 'Error al agregar producto', 'error');
    }
  });

  document.getElementById('formEditarProducto').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombre_producto: document.getElementById('edit_nombre_producto').value.trim(),
      descripcion: document.getElementById('edit_descripcion').value.trim(),
      precio: parseFloat(document.getElementById('edit_precio').value),
      categoria: document.getElementById('edit_categoria').value,
      disponible: 1
    };
    try {
      await fetchJSON(`/api/productos/${idRestaurante}/${productoEnEdicion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      productoEnEdicion = null;
      document.getElementById('modalEditarProducto').style.display = 'none';
      mostrarMensaje('Producto actualizado');
      obtenerProductos();
    } catch {
      mostrarMensaje('Error al actualizar producto', 'error');
    }
  });

  document.getElementById('cerrarModal').addEventListener('click', () => {
    document.getElementById('modalEditarProducto').style.display = 'none';
  });

  document.getElementById('btnAgregarCategoria').addEventListener('click', () => {
    document.getElementById('formCategoria').style.display = 'block';
  });

  document.getElementById('btnCancelarCategoria').addEventListener('click', () => {
    document.getElementById('formCategoria').style.display = 'none';
    document.getElementById('nombre_categoria').value = '';
  });

  document.getElementById('btnGuardarCategoria').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre_categoria').value.trim();
    if (!nombre) return mostrarMensaje('Nombre de categoría requerido', 'error');

    try {
      await fetchJSON('/api/categorias/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_categoria: nombre })
      });
      await cargarCategorias();
      document.getElementById('formCategoria').style.display = 'none';
      mostrarMensaje('Categoría agregada');
    } catch {
      mostrarMensaje('Error al agregar categoría', 'error');
    }
  });

  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', filtrarProductos);
  }
}

function filtrarProductos() {
  const valor = document.getElementById('buscador').value.toLowerCase().trim();
  const filtros = valor.split(/\s+/);
  const filas = document.querySelectorAll('#tablaProductos tbody tr');
  filas.forEach(fila => {
    const texto = Array.from(fila.children).map(td => td.textContent.toLowerCase()).join(' ');
    fila.style.display = filtros.every(palabra => texto.includes(palabra)) ? '' : 'none';
  });
}

// Inicialización
(async function init() {
  const slug = window.location.pathname.split('/')[2];
  try {
    const res = await fetch(`/api/restaurantes/${slug}`);
    const data = await res.json();
    setIdRestauranteProductos(data.id);
    document.getElementById('id_restaurante').value = data.id;
    await cargarCategorias();
    await obtenerProductos();
    registrarEventos();
  } catch (err) {
    mostrarMensaje('Error al cargar restaurante', 'error');
  }
})();
