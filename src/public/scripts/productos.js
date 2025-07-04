// Función genérica para hacer peticiones y devolver el JSON de respuesta
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// Muestra una notificación (toast) personalizada en la interfaz
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

// Otra función para mostrar notificaciones (más básica)
function mostrarNotificacion(mensaje, tipo) {
  const toast = document.createElement('div');
  toast.classList.add('toast', tipo);
  const contenido = document.createElement('span');
  contenido.textContent = mensaje;
  const closeButton = document.createElement('button');
  toast.appendChild(contenido);
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Devuelve la clase CSS correspondiente según el nombre de la categoría
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

// Filtro en tiempo real para los productos mostrados en tabla
function filtrarProductos() {
  const input = document.getElementById('buscador').value.toLowerCase().trim();
  const filtros = input.split(/\s+/);
  const filas = document.querySelectorAll('#tablaProductos tbody tr');

  filas.forEach(fila => {
    const nombre = fila.children[1].textContent.toLowerCase();
    const descripcion = fila.children[2].textContent.toLowerCase();
    const categoria = fila.children[4].textContent.toLowerCase();
    const disponible = fila.children[5].textContent.toLowerCase();

    const coincide = filtros.every(palabra =>
      nombre.includes(palabra) ||
      descripcion.includes(palabra) ||
      categoria.includes(palabra) ||
      disponible.includes(palabra)
    );

    fila.style.display = coincide ? '' : 'none';
  });
}

const categorias = {};

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
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarMensaje('Error al cargar categorías', 'error');
  }
}

function getNombreCategoria(id) {
  return categorias[id] || 'Desconocida';
}

let idRestaurante = null;
let productoEnEdicion = null;

function setIdRestauranteProductos(id) {
  idRestaurante = id;
}

async function obtenerProductos() {
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
          <td>₡${precio.toFixed(2)}</td>
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
  } catch (err) {
    console.error('[obtenerProductos] ❌ Error:', err);
    mostrarMensaje('Error al cargar productos', 'error');
  }
}

window.cargarProducto = async function (id) {
  try {
    const p = await fetchJSON(`/api/productos/${idRestaurante}/${id}`);
    productoEnEdicion = p.id;

    // Llenar campos en el modal
    document.getElementById('edit_id').value = p.id;
    document.getElementById('edit_nombre_producto').value = p.nombre_producto;
    document.getElementById('edit_descripcion').value = p.descripcion || '';
    document.getElementById('edit_precio').value = p.precio;
    document.getElementById('edit_categoria').value = p.categoria;

    // Mostrar modal
    document.getElementById('modalEditarProducto').style.display = 'block';
  } catch (err) {
    mostrarMensaje("Error al cargar el producto", 'error');
  }
};

document.getElementById('cerrarModal').addEventListener('click', () => {
  document.getElementById('modalEditarProducto').style.display = 'none';
});

document.getElementById('formEditarProducto').addEventListener('submit', async (e) => {
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

    mostrarMensaje('Producto actualizado exitosamente', 'success');
    document.getElementById('modalEditarProducto').style.display = 'none';
    productoEnEdicion = null;
    obtenerProductos();
  } catch (error) {
    mostrarMensaje('Error al actualizar el producto', 'error');
  }
});

function copiarOpcionesCategorias() {
  const origen = document.getElementById('categoria');
  const destino = document.getElementById('edit_categoria');
  destino.innerHTML = origen.innerHTML;
}


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
    mostrarNotificacion('Error al actualizar el producto', 'error');
  }
};

async function registrarEventos() {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_categoria: nombreCategoria })
      });
      mostrarMensaje(result.mensaje || 'Categoría agregada exitosamente', 'success');
      await cargarCategorias();
      document.getElementById('formCategoria').style.display = 'none';
      document.getElementById('nombre_categoria').value = '';
    } catch (error) {
      mostrarMensaje('Error al agregar la categoría', 'error');
    }
  });
}

let idRestauranteEmpleado = null;

function setIdRestauranteEmpleados(id) {
  idRestauranteEmpleado = id;
}

async function registrarEventosEmpleado() {
  const form = document.getElementById('formEmpleado');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombreEmpleado: form.nombre.value.trim(),
      claveEmpleado: form.clave.value.trim(),
      restauranteId: idRestauranteEmpleado,
    };

    if (!data.nombreEmpleado || !data.claveEmpleado) {
      mostrarMensaje('Por favor, complete todos los campos.', 'error');
      return;
    }

    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regex.test(data.claveEmpleado)) {
      mostrarMensaje('La clave debe tener al menos 8 caracteres con letras y números.', 'error');
      return;
    }

    try {
      const result = await fetchJSON('/api/usuarios/crearEmpleado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      mostrarMensaje(result.mensaje || 'Empleado agregado exitosamente', 'success');
      form.reset();
    } catch (error) {
      const mensajes = Array.isArray(error.error) ? error.error.join(' | ') : (error.error || 'Error general');
      mostrarMensaje(mensajes, 'error');
    }
  });
}

// Función de inicialización principal
(async function init() {
  const slug = window.location.pathname.split('/')[2];

  try {
    const res = await fetch(`/api/restaurantes/${slug}`);
    const data = await res.json();

    setIdRestauranteProductos(data.id);
    setIdRestauranteEmpleados(data.id);

    document.getElementById('id_restaurante').value = data.id;

    await cargarCategorias();
    await obtenerProductos();

    registrarEventos();
    registrarEventosEmpleado();

  } catch (error) {
    console.error('Error al obtener el restaurante:', error);
    mostrarMensaje('Error al cargar el restaurante', 'error');
  }

  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', filtrarProductos);
  }
})();
