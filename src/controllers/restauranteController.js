// src/controllers/restauranteController.js
const restauranteService = require('../services/restaurantesService');

// 🔹 Obtener restaurante por slug (detalles del restaurante)
exports.obtenerRestaurantePorSlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const restaurante = await restauranteService.obtenerRestaurantePorSlug(slug);

    if (!restaurante) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json(restaurante);
  } catch (error) {
    console.error('[obtenerRestaurantePorSlug] ❌ Error:', error);
    res.status(500).json({ error: 'Error al obtener el restaurante' });
  }
};

// 🔹 Obtener solo el ID del restaurante desde el slug
exports.obtenerIdRestaurante = async (req, res) => {
  const { slug } = req.params;

  try {
    const restauranteId = await restauranteService.obtenerIdRestaurantePorSlug(slug);

    if (!restauranteId) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json({
      id: restauranteId,
      slug,
      message: `Restaurante con el slug "${slug}" encontrado`
    });
  } catch (error) {
    console.error('[obtenerIdRestaurante] ❌ Error:', error);
    res.status(500).json({ error: 'Error al obtener restaurante' });
  }
};

// 🔹 Renderizar vista de productos del restaurante
exports.renderizarVistaProductos = async (req, res) => {
  const { slug } = req.params;

  try {
    const restauranteId = await restauranteService.obtenerIdRestaurantePorSlug(slug);

    if (!restauranteId) {
      return res.status(404).send('Restaurante no encontrado');
    }

    res.render('productos', { slug, idRestaurante: restauranteId });
  } catch (error) {
    console.error('[renderizarVistaProductos] ❌ Error:', error);
    res.status(500).send('Error al cargar la vista del restaurante');
  }
};
