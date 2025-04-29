// src/services/restaurantesService.js
const { obtenerIdPorSlug, obtenerRestaurantePorId} = require('../models/Restaurante');

// Obtener el ID de un restaurante por su slug
const obtenerIdRestaurantePorSlug = async (slug) => {
  return await obtenerIdPorSlug(slug);
};

// Obtener los datos completos del restaurante por slug
const obtenerRestaurantePorSlug = async (slug) => {
  const restauranteId = await obtenerIdPorSlug(slug);

  if (!restauranteId) return null;

  const restaurante = await obtenerRestaurantePorId(restauranteId);
  return restaurante;
};

module.exports = {
  obtenerRestaurantePorSlug,
  obtenerIdRestaurantePorSlug,
  obtenerRestaurantePorId
};
