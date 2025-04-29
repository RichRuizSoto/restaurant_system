// Conectar al servidor WebSocket
const socket = io(); // Asume que el servidor está en el mismo dominio

// Escuchar el evento cuando el estado de un pedido cambia
socket.on('estadoPedidoActualizado', (data) => {
  console.log('[WebSocket] Pedido actualizado recibido:', data);
  const { idPedido, nuevoEstado, numero_orden, mesa, productos, total, creado_en } = data;
  const pedidoElement = document.getElementById(`pedido-${idPedido}`);

  if (pedidoElement) {
    // Eliminar el pedido de la sección actual
    pedidoElement.remove();
  }

  // Crear el nuevo HTML del pedido para el nuevo estado
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

  // Intentar encontrar la sección correspondiente para el nuevo estado
  const nuevaSeccion = document.getElementById(`${nuevoEstado}-section`);

  // Verificar si la sección existe
  if (nuevaSeccion) {
    const listaPedidos = nuevaSeccion.querySelector('ul');
    
    // Verificar si la lista <ul> existe dentro de la sección
    if (listaPedidos) {
      listaPedidos.insertAdjacentHTML('beforeend', nuevoPedidoHTML);
    } else {
      console.error(`No se encontró una lista <ul> dentro de la sección ${nuevoEstado}-section`);
    }
  } else {
    console.error(`No se encontró la sección con el ID ${nuevoEstado}-section`);
  }

  // Notificar al usuario sin hacer uso de alert()
  notificarEstadoActualizado(idPedido, nuevoEstado, numero_orden); // ✅ le pasamos numero_orden como tercer argumento
});

// Función para actualizar el estado del pedido
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
      // Notificar al usuario si el estado del pedido fue actualizado con éxito
      notificarEstadoActualizado(idPedido, nuevoEstado, data.pedido.numero_orden);
    }
  })
  .catch(error => {
    // Si ocurre un error al actualizar el estado
    console.error('Error:', error);
    mostrarMensajeError('Error al actualizar el estado');
  });
}

// Función para mostrar una notificación al usuario (sin usar alert())
function notificarEstadoActualizado(idPedido, nuevoEstado, numero_orden) {
  const mensaje = `El estado del pedido #${numero_orden} ha sido actualizado a ${nuevoEstado}.`;
  
  // Mostrar el mensaje en la página (en lugar de usar alert)
  const notificationElement = document.createElement('div');
  notificationElement.classList.add('notification');
  notificationElement.textContent = mensaje;
  document.body.appendChild(notificationElement);
  
  // Opcional: Ocultar la notificación después de unos segundos
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}

// Función para mostrar un mensaje de error en la interfaz
function mostrarMensajeError(mensaje) {
  const errorElement = document.createElement('div');
  errorElement.classList.add('error-message');
  errorElement.textContent = mensaje;
  document.body.appendChild(errorElement);

  // Opcional: Ocultar el mensaje de error después de unos segundos
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}
