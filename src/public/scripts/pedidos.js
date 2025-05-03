let idRestaurante = null;

function mostrarMensaje(msg, tipo = 'success') {
  const div = document.getElementById('mensaje');
  div.textContent = msg;
  div.style.color = tipo === 'error' ? 'red' : 'green';
  setTimeout(() => div.textContent = '', 3000);
}

// Función para obtener los pedidos
async function obtenerPedidos() {
  if (!idRestaurante) return;

  try {
    const res = await fetch(`/api/pedidos/${idRestaurante}`);
    if (!res.ok) {
      throw new Error('No se pudo obtener los pedidos');
    }

    const pedidos = await res.json();
    const tbody = document.querySelector('#tablaPedidos tbody');
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
      tbody.innerHTML += `
        <tr>
          <td>${pedido.id}</td>
          <td>${pedido.cliente}</td>
          <td>${pedido.productos.map(p => p.nombre).join(', ')}</td>
          <td>$${pedido.total.toFixed(2)}</td>
          <td>${pedido.estado}</td>
          <td>
            <button onclick="cargarPedido(${pedido.id})">Ver</button>
            <button onclick="actualizarEstado(${pedido.id}, 'Completo')">Marcar como Completo</button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    mostrarMensaje(error.message || 'Error al obtener los pedidos', 'error');
  }
}

// Función para cargar detalles del pedido
async function cargarPedido(id) {
  // Lógica para cargar detalles del pedido si es necesario
}

// Función para actualizar el estado del pedido
async function actualizarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`/api/pedidos/${idRestaurante}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error al actualizar el estado');
    }

    mostrarMensaje(data.mensaje || 'Estado actualizado');
    obtenerPedidos();
  } catch (error) {
    mostrarMensaje(error.message || 'Error al actualizar el estado', 'error');
  }
}

// Función inicial para obtener los datos del restaurante
(async function init() {
  const slug = window.location.pathname.split('/')[2];

  try {
    const res = await fetch(`/api/restaurantes/restaurantes/${slug}`);
    if (!res.ok) {
      throw new Error('No se pudo obtener la información del restaurante');
    }

    const data = await res.json();
    idRestaurante = data.id;

    obtenerPedidos();
  } catch (error) {
    mostrarMensaje(error.message || 'Error al cargar el restaurante', 'error');
  }
})();
