const express = require('express');
const router = express.Router();
const restaurantesService = require('../../services/restaurantesService');

// Ruta protegida con autenticación
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  const restaurante = await restaurantesService.obtenerRestaurantePorSlug(slug);
  if (!restaurante) {
    return res.status(404).render('error', { mensaje: 'Restaurante no encontrado' });
  }

  const restId = restaurante.id;

  res.render('admin', { slug, restId }); // ✅ Asegúrate de pasar `restId`
});

module.exports = router;
