// src/middleware/roles.js
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const { user } = req.session;
    if (user && allowedRoles.includes(user.rol)) {
      return next();
    }
    return res.status(403).render('acceso-denegado');
  };
}

module.exports = { authorizeRoles };
