const db = require('../../core/config/database');

const restauranteExiste = async (id_restaurante) => {
  try {
    const [rows] = await db.query('SELECT id FROM establecimientos WHERE id = ?', [id_restaurante]);
    return rows.length > 0;
  } catch (err) {
    console.error('❌ Error al verificar restaurante:', err);
    throw err;
  }
};

const productoExisteEnRestaurante = async (id_producto, id_restaurante) => {
  try {
    const [rows] = await db.query('SELECT id FROM productos WHERE id = ? AND id_restaurante = ?', [id_producto, id_restaurante]);
    return rows.length > 0;
  } catch (err) {
    console.error('❌ Error al verificar producto:', err);
    throw err;
  }
};

module.exports = {
  restauranteExiste,
  productoExisteEnRestaurante
};
