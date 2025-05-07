let graficoGanancias = null;

export async function cargarGananciasPorDia(idRestaurante) {
  const response = await fetch(`/api/ganancias-por-dia?id_restaurante=${idRestaurante}`);
  const datos = await response.json();

  // Crear un mapa de fecha -> total_diario
  const mapaGanancias = {};
  datos.forEach(d => {
    const fecha = new Date(d.fecha_creado).toISOString().split('T')[0]; // yyyy-mm-dd
    mapaGanancias[fecha] = d.total_diario;
  });

  // Generar los últimos 30 días
  const fechas = [];
  const ganancias = [];

  const hoy = new Date();
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);

    const key = fecha.toISOString().split('T')[0]; // yyyy-mm-dd
    const etiqueta = fecha.toLocaleDateString('es-ES'); // para mostrar en el gráfico

    fechas.push(etiqueta);
    ganancias.push(mapaGanancias[key] || 0); // Si no hay ganancia, usar 0
  }

  const ctx = document.getElementById('gananciasPorDiaChart').getContext('2d');

  if (graficoGanancias) {
    graficoGanancias.destroy();
  }

  graficoGanancias = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Ganancia diaria',
        data: ganancias,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 4,
        pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Monto ($)' }
        },
        x: {
          title: { display: true, text: 'Fecha' },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return `$${tooltipItem.raw.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}
