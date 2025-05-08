// 📡 Conexión WebSocket
const socket = io();  // Establece la conexión WebSocket
const sonidoNotificacion = new Audio('/sounds/notificacion.mp3');

// ⚙️ Obtener restauranteId desde variable global o input oculto
let restauranteId = window.restauranteId;
if (!restauranteId) {
  const input = document.getElementById('restaurante-id');
  restauranteId = input?.value;
  window.restauranteId = restauranteId;
}

// 🔗 Unirse a sala del restaurante
if (restauranteId) {
  console.log('🔗 Uniéndose a sala restaurante_', restauranteId);
  socket.emit('unirseARestaurante', restauranteId);
} else {
  console.warn('⚠️ No se encontró restauranteId');
}

// 🎉 Escuchar nuevo pedido
socket.on('nuevoPedido', (pedido) => {
  console.log('[WS] 🆕 Nuevo pedido:', pedido);  // Asegúrate de que esto se ejecuta.
  if (pedido.estado !== 'solicitado') return;

  agregarPedidoAlDOM(pedido);         // Inserta en el DOM
  sonidoNotificacion.play();          // 🔔 Sonido
  notificarEstadoActualizado(pedido.id, pedido.estado, pedido.numero_orden);
});

// 🔄 Escuchar cambios de estado
socket.on('estadoPedidoActualizado', (data) => {
  console.log('[WS] 🔁 Pedido actualizado:', data);

  // Eliminar pedido anterior
  document.getElementById(`pedido-${data.idPedido}`)?.remove();

  // Insertar en nueva sección
  agregarPedidoAlDOM({
    ...data,
    id: data.idPedido,
    estado: data.nuevoEstado
  });

  if (data.nuevoEstado === 'solicitado' || data.nuevoEstado === 'listo') {
    sonidoNotificacion.play();
  }

  notificarEstadoActualizado(data.idPedido, data.nuevoEstado, data.numero_orden);
});


// ✅ Función para insertar pedido en el DOM
function agregarPedidoAlDOM(pedido) {
  const seccion = document.getElementById(`${pedido.estado}-section`);
  const lista = seccion?.querySelector('ul');
  if (!lista) {
    console.error(`❌ No se encontró sección para estado: ${pedido.estado}`);
    return;
  }

  // Si el pedido ya existe, actualízalo
  let item = document.getElementById(`pedido-${pedido.id}`);
  if (item) {
    // Actualizar los datos del pedido (no duplicar el elemento)
    item.querySelector('.pedido-header span:nth-child(1)').textContent = `Orden: #${pedido.numero_orden}`;
    item.querySelector('.pedido-header span:nth-child(2)').textContent = `Mesa: ${pedido.mesa}`;
    item.querySelector('.pedido-header span:nth-child(3)').textContent = `Total: $${parseFloat(pedido.total).toFixed(2)}`;
    item.querySelector('.pedido-header span:nth-child(4)').textContent = `Creado: ${new Date(pedido.creado_en).toLocaleString()}`;

    // Actualizar productos y botones de estado
    item.querySelector('.productos-list').innerHTML = pedido.productos.map(prod => 
      `<li class="producto-item">${prod.cantidad} × ${prod.nombre || `Producto ${prod.id_producto}`}</li>`
    ).join('');

    let botones = '';
    if (pedido.estado === 'solicitado') {
      botones = `
        <button class="button" onclick="actualizarEstadoPedido(${pedido.id}, 'listo')">Marcar como listo</button>
        <button class="button cancel-button" onclick="actualizarEstadoPedido(${pedido.id}, 'cancelado')">Cancelar pedido</button>
      `;
    } else if (pedido.estado === 'listo') {
      botones = `
        <button class="button" onclick="actualizarEstadoPedido(${pedido.id}, 'pagado')">Marcar como pagado</button>
        <button class="button cancel-button" onclick="actualizarEstadoPedido(${pedido.id}, 'cancelado')">Cancelar pedido</button>
      `;
    } else {
      botones = `<span class="estado-finalizado">Pedido ${pedido.estado}</span>`;
    }

    item.querySelector('.pedido-acciones').innerHTML = botones;

  } else {
    // Si el pedido no existe, crear un nuevo item
    item = document.createElement('li');
    item.id = `pedido-${pedido.id}`;
    item.classList.add('pedido-item');

    const productosHTML = Array.isArray(pedido.productos)
      ? pedido.productos.map(p => `<li class="producto-item">${p.cantidad} × ${p.nombre || `Producto ${p.id_producto}`}</li>`).join('')
      : '<li class="producto-item">Sin productos</li>';

    let botones = '';
    if (pedido.estado === 'solicitado') {
      botones = `
        <button class="button" onclick="actualizarEstadoPedido(${pedido.id}, 'listo')">Marcar como listo</button>
        <button class="button cancel-button" onclick="actualizarEstadoPedido(${pedido.id}, 'cancelado')">Cancelar pedido</button>
      `;
    } else if (pedido.estado === 'listo') {
      botones = `
        <button class="button" onclick="actualizarEstadoPedido(${pedido.id}, 'pagado')">Marcar como pagado</button>
        <button class="button cancel-button" onclick="actualizarEstadoPedido(${pedido.id}, 'cancelado')">Cancelar pedido</button>
      `;
    } else {
      botones = `<span class="estado-finalizado">Pedido ${pedido.estado}</span>`;
    }

    item.innerHTML = `
      <div class="pedido-header">
        <span><strong>Orden:</strong> #${pedido.numero_orden}</span>
        <span><strong>Mesa:</strong> ${pedido.mesa}</span>
        <span><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</span>
        <span><strong>Creado:</strong> ${new Date(pedido.creado_en).toLocaleString()}</span>
      </div>
      <ul class="productos-list">${productosHTML}</ul>
      <div class="pedido-acciones">${botones}</div>
    `;

    lista.appendChild(item);
  }
}


// 🔁 Actualizar estado de pedido
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

// 🔔 Notificación visual
function notificarEstadoActualizado(id, estado, numero_orden) {
  const mensaje = `📦 Pedido #${numero_orden} actualizado a "${estado}"`;
  const noti = document.createElement('div');
  noti.className = 'notification';
  noti.textContent = mensaje;
  document.body.appendChild(noti);
  setTimeout(() => noti.remove(), 5000);
}

// ❌ Notificación de error
function mostrarMensajeError(msg) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = msg;
  document.body.appendChild(error);
  setTimeout(() => error.remove(), 5000);
}

// 🧭 Navegación de secciones
function cambiarSeccionActiva(seccion) {
  document.querySelectorAll('.pedido-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`${seccion}-section`)?.classList.add('active');
  document.querySelector(`.nav-button[data-seccion="${seccion}"]`)?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-button').forEach(boton => {
    boton.addEventListener('click', (e) => {
      const seccion = e.currentTarget.getAttribute('data-seccion');
      cambiarSeccionActiva(seccion);
    });
  });

  cambiarSeccionActiva('solicitado');
});
