const db = require('../core/config/database');

exports.obtenerIngresosHoy = async (idRestaurante) => {
  const query = `
    SELECT SUM(total) AS ingresosHoy 
    FROM pedidos 
    WHERE id_restaurante = ? 
      AND fecha_creado = CURDATE() 
      AND estado = 'pagado'
  `;

  const [rows] = await db.query(query, [idRestaurante]);
  return rows[0].ingresosHoy || 0;
}; 
