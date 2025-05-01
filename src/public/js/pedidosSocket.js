// Conectar al servidor WebSocket
const socket = io(); // Asume que el servidor está en el mismo dominio

// 🟡 Escuchar el evento cuando un nuevo pedido es creado (estado 'solicitado')
socket.on('nuevoPedido', (data) => {
  console.log('[WebSocket] 🎉 Nuevo pedido recibido:', data);
  const { id, numero_orden, mesa, productos, total, creado_en, estado } = data;

  // Asegurarse de que solo se muestren los pedidos 'solicitado' automáticamente
  if (estado !== 'solicitado') return;

  const nuevoPedidoHTML = `
    <li id="pedido-${id}">
      <div class="pedido-header">
        <span><strong>Orden:</strong> #${numero_orden}</span>
        <span><strong>Mesa:</strong> ${mesa}</span>
        <span><strong>Total:</strong> $${parseFloat(total).toFixed(2)}</span>
        <span><strong>Creado:</strong> ${new Date(creado_en).toLocaleString()}</span>
      </div>
      <ul class="productos-list">
        ${productos && productos.length > 0 ? productos.map(prod => `
          <li class="producto-item">
            ${prod.nombre || `Producto ID ${prod.id_producto}`} × ${prod.cantidad} ($${prod.precio_unitario || prod.precio})
          </li>
        `).join('') : '<li>No hay productos disponibles</li>'}
      </ul>
      <button class="button" onclick="actualizarEstadoPedido(${id}, 'listo')">Marcar como listo</button> <!-- Aquí añadimos el botón -->
    </li>
  `;

  const seccionSolicitado = document.getElementById('solicitado-section');
  if (seccionSolicitado) {
    const lista = seccionSolicitado.querySelector('ul');
    if (lista) {
      lista.insertAdjacentHTML('beforeend', nuevoPedidoHTML);
    } else {
      console.error('No se encontró la lista <ul> en la sección solicitado-section');
    }
  } else {
    console.error('No se encontró la sección con ID solicitado-section');
  }

  notificarEstadoActualizado(id, estado, numero_orden);
});

// 🟢 Escuchar el evento cuando el estado de un pedido cambia
socket.on('estadoPedidoActualizado', (data) => {
  console.log('[WebSocket] Pedido actualizado recibido:', data);
  const { idPedido, nuevoEstado, numero_orden, mesa, productos, total, creado_en } = data;
  const pedidoElement = document.getElementById(`pedido-${idPedido}`);

  if (pedidoElement) {
    pedidoElement.remove();
  }

  const nuevoPedidoHTML = `
    <li id="pedido-${idPedido}">
      <div class="pedido-header">
        <span><strong>Orden:</strong> #${numero_orden}</span>
        <span><strong>Mesa:</strong> ${mesa}</span>
        <span><strong>Total:</strong> $${parseFloat(total).toFixed(2)}</span>
        <span><strong>Creado:</strong> ${new Date(creado_en).toLocaleString()}</span>
      </div>
      <ul class="productos-list">
        ${productos && productos.length > 0 ? productos.map(prod => `
          <li class="producto-item">
            ${prod.nombre || `Producto ID ${prod.id_producto}`} × ${prod.cantidad} ($${prod.precio_unitario || prod.precio})
          </li>
        `).join('') : '<li>No hay productos disponibles</li>'}
      </ul>
      ${nuevoEstado === 'listo' ? `
        <button class="button" onclick="actualizarEstadoPedido(${idPedido}, 'pagado')">Marcar como pagado</button>
      ` : ''}
      ${nuevoEstado === 'pagado' ? `
        <span>Pedido ya pagado</span>
      ` : ''}
    </li>
  `;

  const nuevaSeccion = document.getElementById(`${nuevoEstado}-section`);
  if (nuevaSeccion) {
    const listaPedidos = nuevaSeccion.querySelector('ul');
    if (listaPedidos) {
      listaPedidos.insertAdjacentHTML('beforeend', nuevoPedidoHTML);
    } else {
      console.error(`No se encontró una lista <ul> dentro de la sección ${nuevoEstado}-section`);
    }
  } else {
    console.error(`No se encontró la sección con el ID ${nuevoEstado}-section`);
  }

  notificarEstadoActualizado(idPedido, nuevoEstado, numero_orden);
});

// 🔁 Función para actualizar el estado del pedido
function actualizarEstadoPedido(idPedido, nuevoEstado) {
  fetch(`/api/pedidos/${idPedido}/estado`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nuevoEstado: nuevoEstado })
  })
    .then(response => response.json())
    .then(data => {
      if (data.pedido) {
        notificarEstadoActualizado(idPedido, nuevoEstado, data.pedido.numero_orden);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      mostrarMensajeError('Error al actualizar el estado');
    });
}

// ✅ Función para notificar al usuario
function notificarEstadoActualizado(idPedido, nuevoEstado, numero_orden) {
  const mensaje = `El estado del pedido #${numero_orden} ha sido actualizado a ${nuevoEstado}.`;

  const notificationElement = document.createElement('div');
  notificationElement.classList.add('notification');
  notificationElement.textContent = mensaje;
  document.body.appendChild(notificationElement);

  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}

// ❌ Función para mostrar errores
function mostrarMensajeError(mensaje) {
  const errorElement = document.createElement('div');
  errorElement.classList.add('error-message');
  errorElement.textContent = mensaje;
  document.body.appendChild(errorElement);

  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

// Función para cambiar la sección activa (basada en el botón seleccionado)
function cambiarSeccionActiva(seccion) {
  const secciones = document.querySelectorAll('.pedido-section');
  const botones = document.querySelectorAll('.nav-button');

  // Ocultar todas las secciones
  secciones.forEach(sec => sec.classList.remove('active'));
  botones.forEach(boton => boton.classList.remove('active'));

  // Mostrar la sección seleccionada y activar el botón correspondiente
  document.getElementById(`${seccion}-section`).classList.add('active');
  document.querySelector(`.nav-button[data-seccion="${seccion}"]`).classList.add('active');
}

// Asociar eventos a los botones de navegación
document.querySelectorAll('.nav-button').forEach(boton => {
  boton.addEventListener('click', (e) => {
    const seccion = e.target.getAttribute('data-seccion');
    cambiarSeccionActiva(seccion);
  });
});

// Llamar a cambiarSeccionActiva con 'solicitado' como sección activa inicial
document.addEventListener('DOMContentLoaded', () => {
  cambiarSeccionActiva('solicitado');
});
