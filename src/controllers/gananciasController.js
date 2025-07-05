const gananciasService = require('../services/gananciasService');

exports.getIngresosHoy = async (req, res) => {
  const { restId } = req.params;

  try {
    const ingresosHoy = await gananciasService.obtenerIngresosHoy(restId);
    res.json({ ingresosHoy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

exports.obtenerGananciasPorDia = async (req, res) => {
  try {
    res.json({ mensaje: "Función obtenerGananciasPorDia en construcción" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en obtenerGananciasPorDia" });
  }
};
