const socket = io();
socket.emit('unirseARestaurante', restId);

socket.on('nuevoPedido', (pedido) => {
  console.log('📦 Nuevo pedido recibido:', pedido);

  const contador = document.getElementById("pedidos-hoy");
  if (contador && !isNaN(parseInt(contador.textContent))) {
    contador.textContent = parseInt(contador.textContent) + 1;
  } else {
    fetch(`/api/pedidos/hoy/${restId}`)
      .then(res => res.json())
      .then(data => contador.textContent = data.pedidosHoy)
      .catch(err => contador.textContent = "Error");
  }

  const tabla = document.getElementById("tabla-actividad-reciente");
  if (tabla && pedido) {
    const nuevaFila = document.createElement("tr");
    const estadoMap = {
      solicitado: "pending",
      listo: "preparing",
      pagado: "delivered",
      cancelado: "cancelled"
    };
    const estadoClase = estadoMap[pedido.estado] || "pending";
    const horaPedido = new Date(pedido.creado_en).toLocaleTimeString("es-ES", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    nuevaFila.innerHTML = `
      <td>#${pedido.numero_orden}</td>
      <td>${pedido.nombre || "Cliente"}</td>
      <td>₡${parseFloat(pedido.total).toFixed(2)}</td>
      <td><span class="badge ${estadoClase}">${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}</span></td>
      <td>${horaPedido}</td>
    `;

    tabla.prepend(nuevaFila);
    if (tabla.children.length > 10) {
      tabla.removeChild(tabla.lastChild);
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const resPedidos = await fetch(`/api/pedidos/hoy/${restId}`);
    const dataPedidos = await resPedidos.json();
    document.getElementById("pedidos-hoy").textContent = dataPedidos.pedidosHoy;

    const resIngresos = await fetch(`/api/ganancias/ingresos/hoy/${restId}`);
    const dataIngresos = await resIngresos.json();
    document.getElementById("ingresos-hoy").textContent = `₡${Number(dataIngresos.ingresosHoy).toFixed(2)}`;

    const resProductos = await fetch(`/api/productos/activos/count/${restId}`);
    const dataProductos = await resProductos.json();
    document.getElementById("productos-activos").textContent = dataProductos.productosActivos;

    const resEmpleados = await fetch(`/api/usuarios/empleados/count/${restId}`);
    const dataEmpleados = await resEmpleados.json();
    document.getElementById("perfiles-registrados").textContent = dataEmpleados.totalEmpleados;

    const tablaActividad = document.getElementById("tabla-actividad-reciente");
    const resActividad = await fetch(`/api/pedidos/ultimos/${restId}`);
    const ultimos = await resActividad.json();

    ultimos.forEach(pedido => {
      const fila = document.createElement("tr");
      const estadoMap = {
        solicitado: "pending",
        listo: "preparing",
        pagado: "delivered",
        cancelado: "cancelled"
      };
      const estadoClase = estadoMap[pedido.estado] || "pending";
      const horaPedido = new Date(pedido.creado_en).toLocaleTimeString("es-ES", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      fila.innerHTML = `
        <td>#${pedido.numero_orden}</td>
        <td>${pedido.nombre || "Cliente"}</td>
        <td>₡${parseFloat(pedido.total).toFixed(2)}</td>
        <td><span class="badge ${estadoClase}">${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}</span></td>
        <td>${horaPedido}</td>
      `;
      tablaActividad.appendChild(fila);
    });
  } catch (err) {
    console.error("❌ Error al obtener datos:", err);
    ["pedidos-hoy", "ingresos-hoy", "productos-activos", "perfiles-registrados"].forEach(id => {
      document.getElementById(id).textContent = "Error";
    });
  }
});

// Buscador
document.addEventListener('DOMContentLoaded', () => {
  const buscador = document.getElementById('buscador-panel');

  buscador.addEventListener('input', () => {
    const valor = buscador.value.toLowerCase().trim();

    document.querySelectorAll('.resaltar, .ocultar').forEach(el => {
      el.classList.remove('resaltar', 'ocultar');
    });

    if (valor === '') return;

    const elementos = document.querySelectorAll('main *:not(script):not(style):not(input):not(.sidebar *)');

    elementos.forEach(el => {
      if (!el.children.length && el.textContent.trim()) {
        const texto = el.textContent.toLowerCase();

        if (texto.includes(valor)) {
          const contenedor = el.closest('.card, tr, section, article, div');
          if (contenedor) contenedor.classList.add('resaltar');
        }
      }
    });

    document.querySelectorAll('.card, tr, section, article, div').forEach(contenedor => {
      if (!contenedor.classList.contains('resaltar')) {
        contenedor.classList.add('ocultar');
      }
    });
  });
});
