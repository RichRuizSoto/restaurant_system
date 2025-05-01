// 📡 Conexión WebSocket
const socket = io();  // Establece la conexión WebSocket
const sonidoNotificacion = new Audio('/sounds/notificacion.mp3');


// 🎉 Escuchar nuevo pedido (estado: solicitado)
socket.on('nuevoPedido', (data) => {
  console.log('[WS] 🆕 Nuevo pedido:', data);
  const { id, numero_orden, mesa, productos, total, creado_en, estado } = data;

  // Solo procesamos pedidos con estado "solicitado"
  if (estado !== 'solicitado') return;

  const nuevoPedidoHTML = generarHTMLPedido(id, numero_orden, mesa, productos, total, creado_en, estado);

  // Buscar la sección de "Solicitado" y agregar el nuevo pedido
  const seccionSolicitado = document.getElementById('solicitado-section');
  const lista = seccionSolicitado?.querySelector('ul');

  if (lista) {
    lista.insertAdjacentHTML('beforeend', nuevoPedidoHTML);
    sonidoNotificacion.play(); // 🔔 Reproducir sonido
    notificarEstadoActualizado(id, estado, numero_orden);
  } else {
    console.error('❌ No se encontró la lista <ul> en solicitado-section');
  }
});

// 🔄 Escuchar cambios de estado
socket.on('estadoPedidoActualizado', (data) => {
  console.log('[WS] 🔁 Pedido actualizado:', data);
  const { idPedido, nuevoEstado, numero_orden, mesa, productos, total, creado_en } = data;

  // Eliminar el pedido de la sección anterior
  document.getElementById(`pedido-${idPedido}`)?.remove();

  // Agregar el pedido en la nueva sección según el estado
  const nuevoHTML = generarHTMLPedido(idPedido, numero_orden, mesa, productos, total, creado_en, nuevoEstado);
  const nuevaSeccion = document.getElementById(`${nuevoEstado}-section`);
  const listaPedidos = nuevaSeccion?.querySelector('ul');

  if (listaPedidos) {
    listaPedidos.insertAdjacentHTML('beforeend', nuevoHTML);
    if (nuevoEstado === 'listo' || nuevoEstado === 'solicitado') {
      sonidoNotificacion.play(); // 🔔 Reproducir sonido
    }
    notificarEstadoActualizado(idPedido, nuevoEstado, numero_orden);
  } else {
    console.error(`❌ No se encontró <ul> en la sección ${nuevoEstado}`);
  }
});

// ✅ Actualizar el estado del pedido
function actualizarEstadoPedido(idPedido, nuevoEstado) {
  fetch(`/api/pedidos/${idPedido}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nuevoEstado })
  })
    .then(res => res.json())
    .then(data => {
      if (data.pedido) {
        notificarEstadoActualizado(idPedido, nuevoEstado, data.pedido.numero_orden);
      }
    })
    .catch(err => {
      console.error('🚨 Error al actualizar estado:', err);
      mostrarMensajeError('No se pudo actualizar el estado del pedido.');
    });
}

// 🧱 Generar HTML del pedido
function generarHTMLPedido(id, numero_orden, mesa, productos, total, creado_en, estado) {
  const productosHTML = Array.isArray(productos) && productos.length
    ? productos.map(prod => `
        <li class="producto-item">
          ${prod.nombre || `Producto ID ${prod.id_producto}`} × ${prod.cantidad}
          ($${prod.precio_unitario ?? prod.precio ?? '---'})
        </li>
      `).join('')
    : '<li class="producto-item">No hay productos disponibles</li>';

  const boton = estado === 'solicitado'
    ? `<button class="button" onclick="actualizarEstadoPedido(${id}, 'listo')">Marcar como listo</button>`
    : estado === 'listo'
    ? `<button class="button" onclick="actualizarEstadoPedido(${id}, 'pagado')">Marcar como pagado</button>`
    : `<span class="estado-finalizado">Pedido ya pagado</span>`;

  return `
    <li id="pedido-${id}" class="pedido-item">
      <div class="pedido-header">
        <span><strong>Orden:</strong> #${numero_orden}</span>
        <span><strong>Mesa:</strong> ${mesa}</span>
        <span><strong>Total:</strong> $${parseFloat(total).toFixed(2)}</span>
        <span><strong>Creado:</strong> ${new Date(creado_en).toLocaleString()}</span>
      </div>
      <ul class="productos-list">${productosHTML}</ul>
      <div class="pedido-acciones">${boton}</div>
    </li>
  `;
}

// 🔔 Notificación de éxito
function notificarEstadoActualizado(id, estado, numero_orden) {
  const mensaje = `📦 Pedido #${numero_orden} actualizado a "${estado}"`;
  const noti = document.createElement('div');
  noti.className = 'notification';
  noti.textContent = mensaje;
  document.body.appendChild(noti);

  // Desaparece la notificación después de 5 segundos
  setTimeout(() => noti.remove(), 5000);
}

// ❌ Notificación de error
function mostrarMensajeError(msg) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = msg;
  document.body.appendChild(error);

  // Desaparece el mensaje de error después de 5 segundos
  setTimeout(() => error.remove(), 5000);
}

// 🧭 Cambiar sección activa
function cambiarSeccionActiva(seccion) {
  document.querySelectorAll('.pedido-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`${seccion}-section`)?.classList.add('active');
  document.querySelector(`.nav-button[data-seccion="${seccion}"]`)?.classList.add('active');
}

// 🧷 Vincular eventos de navegación
document.addEventListener('DOMContentLoaded', () => {
  // Evento para los botones de navegación
  document.querySelectorAll('.nav-button').forEach(boton => {
    boton.addEventListener('click', (e) => {
      const seccion = e.currentTarget.getAttribute('data-seccion');
      cambiarSeccionActiva(seccion);
    });
  });

  // Configuración inicial de la sección activa (por defecto: 'solicitado')
  cambiarSeccionActiva('solicitado');
});
