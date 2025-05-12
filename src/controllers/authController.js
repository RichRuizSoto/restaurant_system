const db = require('../core/config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Iniciar sesión con JWT (y enviar token por cookie segura)
exports.login = async (req, res) => {
  const { nombre, clave, rol } = req.body;

  try {
    const [usuarios] = await db.query(
      `SELECT u.*, e.slug AS restauranteSlug 
       FROM usuarios u 
       JOIN establecimientos e ON u.id_restaurante = e.id 
       WHERE u.nombre = ? AND u.rol = ?`,
      [nombre, rol]
    );

    const usuario = usuarios[0];
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(clave, usuario.clave);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const tokenPayload = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      id_restaurante: usuario.id_restaurante,
      restauranteSlug: usuario.restauranteSlug,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: '1m', // 3 minutos
      });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1 * 60 * 1000, // 3 minutos en milisegundos
      });

    const returnTo = req.body.returnTo;
    if (!returnTo) {
      console.warn("Falta returnTo en el cuerpo de la solicitud");
      return res.status(400).json({ error: "Falta parámetro de redirección (returnTo)." });
    }
    
    console.log("Login recibido con returnTo:", returnTo);
    const redirectUrl = returnTo;
    
    return res.json({ redirectUrl });
  } catch (error) {
    console.error('Error al autenticar al usuario:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Middleware para verificar acceso a un restaurante
exports.verifyRestaurantAccess = async (req, res, next) => {
  const { id_restaurante } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const usuario = usuarios[0];

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol === 'gestor' || usuario.id_restaurante === parseInt(id_restaurante)) {
      return next(); // Acceso permitido
    }

    return res.status(403).json({ error: 'Acceso denegado a este restaurante' });
  } catch (error) {
    console.error('Error al verificar el acceso al restaurante:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};
