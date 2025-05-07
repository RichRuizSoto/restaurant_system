const gananciasService = require('../services/gananciasService');

const obtenerGananciasPorDia = async (req, res, next) => {
  try {
    const id = req.query.id_restaurante;
    const datos = await gananciasService.obtenerGananciasPorDia(id);
    res.json(datos);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerGananciasPorDia,
};
