const path = require('path');
const fs = require('fs');
const express = require('express');

function setupRestaurantesRoutes(app) {
  const publicPath = path.join(__dirname, '..', 'public'); // Ruta correcta a la carpeta 'public'

  if (!fs.existsSync(publicPath)) return;

  fs.readdirSync(publicPath).forEach((nombreRestaurante) => {
    const carpetaRestaurante = path.join(publicPath, nombreRestaurante);

    if (fs.lstatSync(carpetaRestaurante).isDirectory()) {
      const ruta = `/${nombreRestaurante}`;

      // 🥇 Ruta para servir archivos estáticos de cada restaurante
      app.use(`${ruta}`, express.static(carpetaRestaurante));

      console.log(`✅ Ruta registrada: ${ruta} → ${carpetaRestaurante}`);
    }
  });
}

module.exports = setupRestaurantesRoutes;
