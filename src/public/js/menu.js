document.addEventListener('DOMContentLoaded', () => {
  const listaCarrito = document.getElementById('lista-carrito');
  const totalCarrito = document.getElementById('total-carrito');
  const btnEnviar = document.getElementById('btn-enviar-pedido');
  const mesaInput = document.getElementById('mesa');
  const restauranteId = window.restauranteId;
  let carrito = cargarCarrito();

  // Mostrar notificación
  function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    container.appendChild(notification);

    requestAnimationFrame(() => notification.classList.add('show'));

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }

  // Escuchar botones "Agregar"
  document.querySelectorAll('.btn-agregar').forEach(button => {
    button.addEventListener('click', () => {
      const producto = JSON.parse(button.dataset.producto);
      agregarAlCarrito(producto);
    });
  });

  // Agregar producto al carrito
  function agregarAlCarrito(producto) {
    const existente = carrito.find(p => p.id_producto === producto.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({
        id_producto: producto.id,
        nombre: producto.nombre_producto,
        precio: parseFloat(producto.precio),
        cantidad: 1
      });
    }
    guardarCarrito();
    renderizarCarrito();
    showNotification(`${producto.nombre_producto} agregado al carrito 🛒`);
  }

  // Renderizar productos del carrito
  function renderizarCarrito() {
    listaCarrito.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}
        <button class="quitar" data-index="${index}" aria-label="Quitar del carrito">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button class="disminuir" data-index="${index}" aria-label="Disminuir cantidad">
          <i class="fas fa-minus-circle"></i>
        </button>
      `;
      listaCarrito.appendChild(li);
      total += item.precio * item.cantidad;
    });

    totalCarrito.textContent = total.toFixed(2);

    // Quitar producto
    document.querySelectorAll('.quitar').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = parseInt(e.currentTarget.dataset.index);
        const eliminado = carrito.splice(i, 1);
        guardarCarrito();
        renderizarCarrito();
        showNotification(`${eliminado[0].nombre} eliminado del carrito`, 'warning');
      });
    });

    // Disminuir cantidad
    document.querySelectorAll('.disminuir').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = parseInt(e.currentTarget.dataset.index);
        const item = carrito[i];

        if (item.cantidad > 1) {
          item.cantidad -= 1;
          showNotification(`Cantidad de ${item.nombre} reducida`, 'info');
        } else {
          carrito.splice(i, 1);
          showNotification(`${item.nombre} eliminado del carrito`, 'warning');
        }

        guardarCarrito();
        renderizarCarrito();
      });
    });
  }

  // Enviar pedido
  btnEnviar.addEventListener('click', async () => {
    const mesa = parseInt(mesaInput.value);
    if (!mesa || mesa <= 0) {
      return showNotification('Por favor ingresa un número de mesa válido', 'error');
    }

    if (carrito.length === 0) {
      return showNotification('El carrito está vacío', 'warning');
    }

    const total = parseFloat(totalCarrito.textContent);
    const pedido = {
      id_restaurante: restauranteId,
      mesa,
      productos: carrito.map(p => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        precio: p.precio
      })),
      total,
      estado: 'pendiente'
    };

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });

      const { data, numero_orden } = await res.json();

      if (res.ok) {
        showNotification(`✅ Pedido enviado con éxito. N° orden: ${numero_orden}`, 'success');
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
      } else {
        showNotification(data?.mensaje || 'Error al enviar el pedido', 'error');
      }
    } catch (err) {
      console.error('❌ Error al enviar el pedido:', err);
      showNotification('Error de conexión. Inténtalo nuevamente.', 'error');
    }
  });

  // Guardar carrito en localStorage
  function guardarCarrito() {
    try {
      const data = {
        restauranteId,
        items: carrito
      };
      localStorage.setItem('carrito', JSON.stringify(data));
    } catch (err) {
      console.error('❌ Error al guardar carrito:', err);
      showNotification('No se pudo guardar el carrito', 'error');
    }
  }

  // Cargar carrito desde localStorage
  function cargarCarrito() {
    try {
      const data = JSON.parse(localStorage.getItem('carrito'));
      if (!data || data.restauranteId !== restauranteId) return [];
      return data.items || [];
    } catch (err) {
      console.error('❌ Error al cargar carrito:', err);
      return [];
    }
  }

  renderizarCarrito();
});
