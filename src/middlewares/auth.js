const jwt = require('jsonwebtoken');
const pool = require('../core/config/database'); // Asegúrate de tener configurada la conexión a la base de datos

// Middleware para verificar si el usuario está autenticado con JWT
const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        // Guardar ruta original en sesión si es vista HTML
        if (req.accepts('html')) {
            req.session.returnTo = req.originalUrl;
            return res.redirect('/login');
        } else {
            return res.status(401).json({ error: 'No autenticado' });
        }
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });

        req.user = decoded;
        next();
    });
};
// Middleware para verificar el acceso al restaurante con JWT
const hasAccessToRestaurant = async (req, res, next) => {
    const { slug } = req.params;
    const userId = req.user.id;
  
    try {
      const [userRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
      const user = userRows[0];
  
      if (!user) return res.status(404).send('Usuario no encontrado');
  
      if (user.rol === 'gestor') return next();
  
      // Buscar el restaurante por slug
      const [restRows] = await pool.query('SELECT * FROM establecimientos WHERE slug = ?', [slug]);
      const restaurante = restRows[0];
  
      if (!restaurante) return res.status(404).send('Restaurante no encontrado');
  
      if (restaurante.id === user.id_restaurante) {
        return next(); // Usuario tiene acceso a su restaurante
      }
  
      return res.status(403).send('Acceso denegado a este restaurante');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al verificar acceso');
    }
  };
  

// Middleware para verificar el acceso según el rol con JWT
const checkRoleAccess = (allowedRoles) => {
  return (req, res, next) => {
    const { rol } = req.user;  // El rol del usuario está en el token JWT
    if (allowedRoles.includes(rol)) {
      return next(); // El rol es válido, continuamos
    }
    return res.status(403).json({ error: 'Acceso denegado para este rol' });
  };
};

module.exports = {
  isAuthenticated,
  hasAccessToRestaurant,
  checkRoleAccess
};
