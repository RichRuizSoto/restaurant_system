// src/models/Restaurante.js
const db = require('../core/config/database');

// Función para verificar si un restaurante existe por su slug
const obtenerIdPorSlug = async (slug) => {
  const [result] = await db.query(`SELECT id FROM establecimientos WHERE LOWER(REPLACE(nombre, ' ', '_')) = ?`, [slug]);
  return result.length ? result[0].id : null;
};

// Función para obtener los detalles de un restaurante por su id
const obtenerRestaurantePorId = async (id) => {
  const [result] = await db.query(`SELECT * FROM establecimientos WHERE id = ?`, [id]);
  return result.length ? result[0] : null;
};

module.exports = {
  obtenerIdPorSlug,
  obtenerRestaurantePorId
};
