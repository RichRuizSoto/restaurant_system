const jwt = require('jsonwebtoken');
const pool = require('../core/config/database'); // Conexión a la base de datos

// Middleware para verificar si el usuario está autenticado mediante cookie con JWT
const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token; // Leer JWT desde cookie

  if (!token) {
    const returnTo = encodeURIComponent(req.originalUrl);
    return res.redirect(`/auth/login?returnTo=${returnTo}`);
  }

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.rol) {
    throw new Error('Token inválido');
  }
  req.user = decoded;
  next();
} catch (err) {
  console.error('JWT Error:', err.message);
  const returnTo = encodeURIComponent(req.originalUrl);
  return res.redirect(`/auth/login?returnTo=${returnTo}`);
}
};

// Middleware para verificar el acceso a un restaurante según slug y rol
const hasAccessToRestaurant = async (req, res, next) => {
  const { slug } = req.params;
  const userId = req.user.id;

  try {
    const [userRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const user = userRows[0];

    if (!user) return res.status(404).send('Usuario no encontrado');

    if (user.rol === 'gestor') return next(); // Los gestores acceden a todo

    const [restRows] = await pool.query('SELECT * FROM establecimientos WHERE slug = ?', [slug]);
    const restaurante = restRows[0];

    if (!restaurante) return res.status(404).send('Restaurante no encontrado');

    if (restaurante.id === user.id_restaurante) {
      return next(); // El usuario tiene acceso a su restaurante
    }

    return res.redirect('/acceso-denegado');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error al verificar acceso');
  }
};

// Middleware para validar si el usuario tiene el rol adecuado
const checkRoleAccess = (allowedRoles) => {
  return (req, res, next) => {
    const { rol } = req.user;

    if (allowedRoles.includes(rol)) {
      return next(); // El rol es permitido
    }

    return res.redirect('/acceso-denegado');
  };
};

module.exports = {
  isAuthenticated,
  hasAccessToRestaurant,
  checkRoleAccess
};
