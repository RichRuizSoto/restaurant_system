// src/middleware/restauranteAccess.js
function restrictToOwnRestaurante(req, res, next) {
  const { user } = req.session;
  const restauranteId = req.params.restauranteId || req.body.restauranteId;

  if (user.rol === 'admin' || user.restauranteId === restauranteId) {
    return next();
  }

  return res.status(403).render('acceso-denegado');
}

module.exports = {
  restrictToOwnRestaurante,
};
