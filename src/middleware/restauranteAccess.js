const db = require('../core/config/database');

async function restrictToOwnRestaurante(req, res, next) {
  const { user } = req.session;
  const path = req.originalUrl;
  const slug = req.params.slug;

  console.log('User:', user);
  console.log('Path:', path);
  console.log('Slug:', slug);

  if (!user) {
    console.log('Acceso denegado: Usuario no autenticado');
    return res.status(401).render('acceso-denegado');
  }

  let targetRestauranteId = null;

  try {
    if (path.startsWith('/productos/') && slug) {
      console.log('Buscando restaurante asociado al producto...');
      const [[producto]] = await db.query(
        'SELECT id_restaurante FROM productos WHERE slug = ?',
        [slug]
      );
      targetRestauranteId = producto?.id_restaurante;
      if (!targetRestauranteId) {
        console.log(`Producto con slug ${slug} no encontrado.`);
      }
    } else if (
      (path.startsWith('/pedidos/') ||
        path.startsWith('/admin/') ||
        path.startsWith('/menu/') ||
        slug)
    ) {
      console.log('Buscando restaurante asociado al slug en establecimientos...');
      const [[restaurante]] = await db.query(
        'SELECT id FROM establecimientos WHERE slug = ?',
        [slug]
      );
      targetRestauranteId = restaurante?.id;
      if (!targetRestauranteId) {
        console.log(`Restaurante con slug ${slug} no encontrado.`);
      }
    }

    if (!targetRestauranteId) {
      console.log('Acceso denegado: Restaurante no encontrado');
      return res.status(403).render('acceso-denegado');
    }

    if (user.rol === 'admin' || user.restauranteId === targetRestauranteId) {
    console.log('Acceso permitido');
    return next();
    } else {
    console.log('Acceso denegado: Usuario no autorizado para acceder al restaurante');
    return res.status(403).render('acceso-denegado');
    }
  } catch (error) {
    console.error('Error en restrictToOwnRestaurante:', error);
    return res.status(500).render('error', {
      error: 'Error interno del servidor.',
    });
  }
}

module.exports = { restrictToOwnRestaurante };
