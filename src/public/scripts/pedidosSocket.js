const restauranteId = window.restauranteId || document.getElementById('restaurante-id')?.value; //Asegura que restauranteId existe

document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const sonidoNotificacion = new Audio('/sounds/notificacion.mp3');

  // Conexión WebSocket
  socket.on('connect', () => {
    console.log('🟢 Cliente conectado a WebSocket');

    if (restauranteId) {
      console.log('🔗 Uniéndose a sala restaurante_', restauranteId);
      socket.emit('unirseARestaurante', restauranteId);
    } else {
      console.warn('⚠️ No se encontró restauranteId');
    }
  });

  //Asegura que aparecezca en tiempo real el pedido recien creado
  socket.on('nuevoPedido', (pedido) => {
    console.log('[WS] 🆕 Nuevo pedido recibido:', pedido);

    if (pedido.estado !== 'solicitado') {
      console.warn('⛔ Pedido ignorado por estado no válido:', pedido.estado);
      return;
    }

    socket.emit('unirseASalaExclusiva', restauranteId, pedido.id);

    agregarPedidoAlDOM(pedido);
    sonidoNotificacion.play();
    notificarEstadoActualizado(pedido.id, pedido.estado, pedido.numero_orden);
  });

  socket.onAny((event, ...args) => {
    console.log(`📥 Evento recibido: ${event}`, args);
  });

  socket.on('unidoARestaurante', (sala) => {
    console.log(`📡 Cliente unido a sala ${sala}`);
  });

  // 🔄 Escuchar cambios de estado
  socket.on('estadoPedidoActualizado', (data) => {
    console.log('[WS] 🔁 Pedido actualizado:', data);

    document.getElementById(`pedido-${data.idPedido}`)?.remove();

    agregarPedidoAlDOM({
      ...data,
      id: data.idPedido,
      estado: data.nuevoEstado
    });

    if (['solicitado', 'listo'].includes(data.nuevoEstado)) {
      sonidoNotificacion.play();
    }

    notificarEstadoActualizado(data.idPedido, data.nuevoEstado, data.numero_orden);
  });

  // 🧭 Navegación entre secciones
  document.querySelectorAll('.nav-button').forEach(boton => {
    boton.addEventListener('click', (e) => {
      const seccion = e.currentTarget.getAttribute('data-seccion');
      cambiarSeccionActiva(seccion);
    });
  });

  cargarPedidosIniciales();

});

// Cargar pedidos existentes en estado 'solicitado' al iniciar
async function cargarPedidosIniciales() {
  try {
    const res = await fetch(`/api/pedidos/estado/${window.restauranteId}`);
    const data = await res.json();

    const estados = ['solicitado', 'listo', 'pagado', 'cancelado'];
    estados.forEach(estado => {
      if (data[estado] && Array.isArray(data[estado])) {
        data[estado].forEach(pedido => {
          agregarPedidoAlDOM(pedido);
        });
      }
    });
  } catch (err) {
    console.error('❌ Error al cargar pedidos iniciales:', err);
  }
}







// Función para insertar pedido en el DOM
function agregarPedidoAlDOM(pedido) {
  if (!pedido || !pedido.id || !pedido.numero_orden || !pedido.productos) {
    console.warn('⚠️ Pedido inválido o incompleto:', pedido);
    return;
  }

  const seccion = document.getElementById(`${pedido.estado}-section`);
  const lista = document.getElementById(`pedidos-${pedido.estado}`);
  if (!lista) {
    console.error(`❌ No se encontró sección para estado: ${pedido.estado}`);
    return;
  }

  let item = document.getElementById(`pedido-${pedido.id}`);
  if (item) {
    item.querySelector('.pedido-header span:nth-child(1)').textContent = `Orden: #${pedido.numero_orden}`;
    item.querySelector('.pedido-header span:nth-child(2)').textContent = `Mesa: ${pedido.mesa}`;
    item.querySelector('.pedido-header span:nth-child(3)').textContent = `Total: $${parseFloat(pedido.total).toFixed(2)}`;
    item.querySelector('.pedido-header span:nth-child(4)').textContent = `Creado: ${new Date(pedido.creado_en).toLocaleString()}`;
    item.querySelector('.pedido-header span:nth-child(5)').textContent = `Servicio: ${pedido.tipo_servicio}`;

    item.querySelector('.productos-list').innerHTML = pedido.productos.map(prod =>
      `<li class="producto-item">${prod.cantidad} × ${prod.nombre || `Producto ${prod.id_producto}`}</li>`
    ).join('');
  } else {
    item = document.createElement('li');
    item.id = `pedido-${pedido.id}`;
    item.classList.add('pedido-item');

    const productosHTML = Array.isArray(pedido.productos)
      ? pedido.productos.map(p => `<li class="producto-item">${p.cantidad} × ${p.nombre || `Producto ${p.id_producto}`}</li>`).join('')
      : '<li class="producto-item">Sin productos</li>';

    item.innerHTML = `
      <div class="pedido-header">
        <span><strong>Orden:</strong> #${pedido.numero_orden}</span>
        <span><strong>Mesa:</strong> ${pedido.mesa}</span>
        <span><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</span>
        <span><strong>Creado:</strong> ${new Date(pedido.creado_en).toLocaleString()}</span>
        <span><strong>Servicio:</strong> ${pedido.tipo_servicio}</buttspanon>
      </div>
      <ul class="productos-list">${productosHTML}</ul>
      <div class="pedido-acciones">${getBotonesParaEstado(pedido.id, pedido.estado)}</div>
    `;

    lista.appendChild(item);
  }

  const acciones = item.querySelector('.pedido-acciones');
  if (acciones) {
    acciones.innerHTML = getBotonesParaEstado(pedido.id, pedido.estado);
  }
}

// ♻️ Obtener botones por estado
function getBotonesParaEstado(id, estado) {

  if (estado === 'solicitado') {
    return `
      <button class="button" onclick="actualizarEstadoPedido(${id}, 'listo')">Marcar como listo</button>
      <button class="button cancel-button" onclick="actualizarEstadoPedido(${id}, 'cancelado')">Cancelar pedido</button>
      <button class="button info-button" onclick="mostrarInformacionPedido(${id})"><i class="fas fa-info-circle"></i> Información</button>
      `;
  } else if (estado === 'listo') {
    return `
      <button class="button" onclick="actualizarEstadoPedido(${id}, 'pagado')">Marcar como pagado</button>
      <button class="button cancel-button" onclick="actualizarEstadoPedido(${id}, 'cancelado')">Cancelar pedido</button>
      <button class="button info-button" onclick="mostrarInformacionPedido(${id})"><i class="fas fa-info-circle"></i> Información</button>
    `;
  } else {
    return `<span class="estado-finalizado">Pedido ${estado}</span>`;
  }
}


function mostrarInformacionPedido(id) {
  fetch(`/api/pedidos/${id}`)
    .then(res => res.json())
    .then(data => {
      const pedido = data.pedido;
      if (!pedido) return mostrarMensajeError('Pedido no encontrado');

      const modalBody = document.getElementById('modal-body-content');

      const detallesCliente = (pedido.nombre || pedido.telefono || pedido.direccion) ? `
        <h3>Datos del Cliente</h3>
        <p><strong>Nombre:</strong> ${pedido.nombre || '—'}</p>
        <p><strong>Teléfono:</strong> ${pedido.telefono || '—'}</p>
        <p><strong>Dirección:</strong> ${pedido.direccion || '—'}</p>
      ` : '';

      modalBody.innerHTML = `
        <p><strong>Orden #:</strong> ${pedido.numero_orden}</p>
        <p><strong>Mesa:</strong> ${pedido.mesa}</p>
        <p><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</p>
        <p><strong>Estado:</strong> ${pedido.estado}</p>
        <p><strong>Tipo de servicio:</strong> ${pedido.tipo_servicio}</p>
        <p><strong>Creado en:</strong> ${new Date(pedido.creado_en).toLocaleString()}</p>

        ${detallesCliente}

        <h3>Productos</h3>
        <ul>
          ${Array.isArray(pedido.productos) ? pedido.productos.map(p => `
            <li>${p.cantidad} × ${p.nombre || 'Producto sin nombre'} - $${parseFloat(p.precio_unitario).toFixed(2)}</li>
          `).join('') : '<li>No hay productos</li>'}
        </ul>
      `;

      // Mostrar modal
      const modal = document.getElementById('modal-info');
      modal.classList.remove('hidden');

      // Agregar evento para cerrar modal clickeando en la "X"
      document.getElementById('modal-close-btn').onclick = cerrarModal;

      // También cerrar modal si el usuario clickea fuera del contenido
      modal.onclick = (e) => {
        if (e.target === modal) cerrarModal();
      };
    })
    .catch(err => {
      console.error('❌ Error al obtener detalles del pedido:', err);
      mostrarMensajeError('No se pudo cargar la información del pedido.');
    });
}

function cerrarModal() {
  document.getElementById('modal-info').classList.add('hidden');
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

// 🧭 Cambiar sección activa
function cambiarSeccionActiva(seccion) {
  document.querySelectorAll('.pedido-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`${seccion}-section`)?.classList.add('active');
  document.querySelector(`.nav-button[data-seccion="${seccion}"]`)?.classList.add('active');
}
