const db = require('../core/config/database');

async function obtenerIdPorSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    console.warn('[obtenerIdPorSlug] Slug inválido:', slug);
    return null; // Devolvemos null si el slug es inválido
  }

  try {
    const query = `
      SELECT id 
      FROM establecimientos 
      WHERE LOWER(slug) = ?   -- Buscamos el slug de forma insensible a mayúsculas/minúsculas
      LIMIT 1
    `;
    const [rows] = await db.query(query, [slug.toLowerCase()]);

    // Si se encuentra el restaurante, devolvemos el ID
    return rows.length > 0 ? rows[0].id : null;
  } catch (error) {
    console.error('[obtenerIdPorSlug] Error al buscar el restaurante:', error);
    return null; // En caso de error, devolvemos null
  }
}

module.exports = { obtenerIdPorSlug };
