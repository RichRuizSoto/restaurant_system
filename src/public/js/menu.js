document.addEventListener('DOMContentLoaded', () => {
  const listaCarrito = document.getElementById('lista-carrito');
  const totalCarrito = document.getElementById('total-carrito');
  const btnEnviar = document.getElementById('btn-enviar-pedido');
  const mesaInput = document.getElementById('mesa');
  let carrito = cargarCarrito();

  // Función para mostrar notificaciones
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  // Escuchar botones "Agregar"
  document.querySelectorAll('.btn-agregar').forEach(button => {
    button.addEventListener('click', () => {
      const producto = JSON.parse(button.dataset.producto);
      agregarAlCarrito(producto);
    });
  });

  // Agregar productos al carrito
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
  }

  // Renderizar carrito
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

    document.querySelectorAll('.quitar').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = parseInt(e.currentTarget.dataset.index);
        carrito.splice(i, 1);
        guardarCarrito();
        renderizarCarrito();
      });
    });

    document.querySelectorAll('.disminuir').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = parseInt(e.currentTarget.dataset.index);
        if (carrito[i].cantidad > 1) {
          carrito[i].cantidad -= 1;
        } else {
          carrito.splice(i, 1);
        }
        guardarCarrito();
        renderizarCarrito();
      });
    });
  }

  // Enviar pedido
  btnEnviar.addEventListener('click', async () => {
    const mesa = parseInt(mesaInput.value);
    if (isNaN(mesa) || mesa <= 0) {
      return showNotification('Por favor, ingresa un número de mesa válido', 'error');
    }

    if (carrito.length === 0) {
      return showNotification('No hay productos en el carrito', 'warning');
    }

    const total = parseFloat(totalCarrito.textContent);
    const pedido = {
      id_restaurante: window.restauranteId,
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
        showNotification(`✅ Pedido enviado. N° orden: ${numero_orden}`, 'success');
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
      } else {
        showNotification(data.mensaje || 'Error al enviar el pedido', 'error');
        console.log('Error en el envío del pedido:', data);
      }
    } catch (error) {
      console.error('❌ Error al enviar el pedido:', error);
      showNotification('Error de conexión con el servidor', 'error');
    }
  });

  // Guardar carrito
  function guardarCarrito() {
    try {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (err) {
      console.error('❌ Error al guardar carrito en localStorage', err);
      showNotification('No se pudo guardar el carrito. Inténtalo nuevamente', 'error');
    }
  }

  // Cargar carrito
  function cargarCarrito() {
    try {
      const data = localStorage.getItem('carrito');
      if (!data) return [];

      const parsed = JSON.parse(data);
      if (parsed.restauranteId !== window.restauranteId) {
        localStorage.removeItem('carrito');
        return [];
      }

      return parsed.items || [];
    } catch (err) {
      console.error('❌ Error al cargar carrito desde localStorage', err);
      showNotification('Error al cargar el carrito. Inténtalo nuevamente', 'error');
      return [];
    }
  }

  renderizarCarrito();
});
