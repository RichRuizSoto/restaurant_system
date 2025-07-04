const db = require('../core/config/database'); // O el método que uses para hacer consultas
const gananciasService = require('../services/gananciasService');

exports.getIngresosHoy = async (req, res) => {
  const { restId } = req.params;

  try {
    const query = `
      SELECT SUM(total) AS ingresosHoy 
      FROM pedidos 
      WHERE id_restaurante = ? 
      AND fecha_creado = CURDATE() 
      AND estado IN ('pagado', 'listo')`;

    const [rows] = await db.query(query, [restId]);

    const ingresosHoy = rows[0].ingresosHoy || 0;

    res.json({ ingresosHoy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

exports.obtenerGananciasPorDia = async (req, res) => {
  try {
    // Por ejemplo, responde algo simple por ahora
    res.json({ mensaje: "Función obtenerGananciasPorDia en construcción" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en obtenerGananciasPorDia" });
  }
};
