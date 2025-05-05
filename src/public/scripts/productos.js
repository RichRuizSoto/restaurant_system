let idRestaurante = null;
let productoEnEdicion = null;

// Mapeo de ID de categoría a nombre de categoría
let categorias = {}; // Reemplaza la constante por una variable vacía

async function cargarCategorias() {
  try {
    const res = await fetch('/api/categorias');
    const data = await res.json();
    
    // Obtener el elemento select
    const select = document.getElementById('categoria');
    
    // Limpiar las opciones previas (si es que ya hay alguna)
    select.innerHTML = '<option value="">Seleccione una categoría</option>';
    
    // Llenar el objeto categorias
    data.forEach(cat => {
      categorias[cat.id] = cat.nombre;  // Aquí agregamos el ID y nombre de la categoría
      const option = document.createElement('option');
      option.value = cat.id; // El valor del option debe ser el ID de la categoría
      option.textContent = cat.nombre; // El texto visible es el nombre de la categoría
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarMensaje('Error al cargar categorías', 'error');
  }
}

function mostrarMensaje(msg, tipo = 'success') {
  const div = document.getElementById('mensaje');
  div.textContent = msg;
  div.style.color = tipo === 'error' ? 'red' : 'green';
  setTimeout(() => div.textContent = '', 3000);
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

async function obtenerProductos() {
  if (!idRestaurante) return;

  console.log("Obteniendo productos para restaurante:", idRestaurante);

  try {
    const res = await fetch(`/api/productos/${idRestaurante}`);
    const data = await res.json();

    if (!res.ok) {
      console.warn("[Frontend] No se encontraron productos:", data?.mensaje);
      mostrarMensaje(data?.mensaje || 'No hay productos disponibles.', 'error');
      return;
    }

    const productos = data;

    console.log("Productos recibidos:", productos);

    const tbody = document.querySelector('#tablaProductos tbody');
    tbody.innerHTML = ''; // Limpiar la tabla

    if (productos.length > 0) {
      productos.forEach(p => {
        const precio = parseFloat(p.precio);
        // Aquí es donde se hace la corrección
        const categoriaNombre = categorias[p.categoria] || 'Desconocida'; // Usar el ID de la categoría para obtener el nombre

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
    } else {
      mostrarMensaje("No hay productos disponibles aún.");
    }
  } catch (err) {
    console.error('[obtenerProductos] ❌ Error:', err);
    mostrarMensaje('Error al cargar productos', 'error');
  }
}



async function cargarProducto(id) {
  const res = await fetch(`/api/productos/${idRestaurante}/${id}`);
  const p = await res.json();

  const form = document.getElementById('formProducto');
  form.nombre_producto.value = p.nombre_producto;
  form.descripcion.value = p.descripcion;
  form.precio.value = p.precio;
  form.categoria.value = p.categoria;

  productoEnEdicion = p.id;

  document.getElementById('btnGuardar').style.display = 'none';
  document.getElementById('btnActualizar').style.display = 'inline-block';
  document.getElementById('btnCancelar').style.display = 'inline-block';
}

async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;
  const res = await fetch(`/api/productos/${idRestaurante}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  mostrarMensaje(data.mensaje || 'Producto eliminado');
  obtenerProductos();
}

async function toggleDisponibilidad(id, estadoActual) {
  const nuevoEstado = estadoActual ? 0 : 1;
  const res = await fetch(`/api/productos/${idRestaurante}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disponible: nuevoEstado })
  });

  const data = await res.json();
  if (res.ok) {
    alert(data.mensaje || 'Estado actualizado');
    obtenerProductos();
  } else {
    alert('Error al actualizar el producto');
    console.error(data);
  }
}

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

  const res = await fetch('/api/productos/agregar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    const mensajes = Array.isArray(result.error) ? result.error.join(' | ') : (result.error || 'Error general');
    mostrarMensaje(mensajes, 'error');
    return;
  }

  mostrarMensaje(result.mensaje || 'Producto agregado');
  form.reset();
  obtenerProductos();
});

document.getElementById('btnAgregarCategoria').addEventListener('click', () => {
  // Mostrar el formulario de agregar categoría
  document.getElementById('formCategoria').style.display = 'block';
});

document.getElementById('btnCancelarCategoria').addEventListener('click', () => {
  // Ocultar el formulario de agregar categoría sin hacer nada
  document.getElementById('formCategoria').style.display = 'none';
  document.getElementById('nombre_categoria').value = '';  // Limpiar el campo
});

document.getElementById('btnGuardarCategoria').addEventListener('click', async () => {
  const nombreCategoria = document.getElementById('nombre_categoria').value.trim();

  if (!nombreCategoria) {
    alert('Por favor, ingresa un nombre para la categoría.');
    return;
  }

  // Enviar la nueva categoría al backend
  try {
    const res = await fetch(`/api/categorias/agregar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre_categoria: nombreCategoria })
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result?.error || 'Error al agregar la categoría');
      return;
    }

    // Mostrar mensaje de éxito
    mostrarMensaje(result.mensaje || 'Categoría agregada exitosamente');

    // Actualizar las categorías
    await cargarCategorias();  // Esto recargará la lista de categorías
    document.getElementById('formCategoria').style.display = 'none';  // Ocultar el formulario
    document.getElementById('nombre_categoria').value = '';  // Limpiar el campo
  } catch (error) {
    console.error('Error al agregar categoría:', error);
    mostrarMensaje('Error al agregar la categoría', 'error');
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

  const res = await fetch(`/api/productos/${idRestaurante}/${productoEnEdicion}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    const mensaje = result?.error || 'Error al actualizar producto';
    mostrarMensaje(mensaje, 'error');
    console.warn('🚫 Fallo al actualizar producto:', result);
    return;
  }

  mostrarMensaje(result.mensaje || 'Producto actualizado');
  form.reset();
  productoEnEdicion = null;
  document.getElementById('btnGuardar').style.display = 'inline-block';
  document.getElementById('btnActualizar').style.display = 'none';
  document.getElementById('btnCancelar').style.display = 'none';
  obtenerProductos();
});

// Detectar el slug desde la URL y obtener el ID del restaurante
(async function init() {
  const slug = window.location.pathname.split('/')[2]; // /restaurantes/:slug/productos
  try {
    const res = await fetch(`/api/restaurantes/${slug}`);
    const data = await res.json();
    idRestaurante = data.id;

    // Setear hidden input para futuros POST
    document.getElementById('id_restaurante').value = idRestaurante;

    await cargarCategorias(); // ✅ Cargar categorías desde la base de datos
    obtenerProductos();       // Luego cargar productos

  } catch (error) {
    console.error('Error al obtener el restaurante:', error);
    mostrarMensaje('Error al cargar el restaurante', 'error');
  }
})();
