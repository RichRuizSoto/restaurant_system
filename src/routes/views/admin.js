const express = require('express');
const router = express.Router();
const restaurantesService = require('../../services/restaurantesService');
const { restrictToOwnRestaurante } = require('../../middleware/restauranteAccess');

// Ruta protegida con autenticación y restricción al restaurante
router.get('/:slug', restrictToOwnRestaurante, async (req, res) => {
  const { slug } = req.params;

  const restaurante = await restaurantesService.obtenerRestaurantePorSlug(slug);
  if (!restaurante) {
    return res.status(404).render('error', { mensaje: 'Restaurante no encontrado' });
  }

  const restId = restaurante.id;

  // Renderizamos la vista de admin con la información del restaurante
  res.render('admin', { slug, restId });
});

module.exports = router;
