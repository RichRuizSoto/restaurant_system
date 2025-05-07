const db = require('../core/config/database');

const obtenerGananciasPorDia = async (id_restaurante) => {
  const [rows] = await db.execute(`
    SELECT fecha_creado, SUM(total) AS total_diario
    FROM pedidos
    WHERE estado = 'pagado' AND id_restaurante = ?
    GROUP BY fecha_creado
    ORDER BY fecha_creado ASC
  `, [id_restaurante]);

  return rows;
};

module.exports = {
  obtenerGananciasPorDia,
};
