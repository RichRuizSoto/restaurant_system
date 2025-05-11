const db = require('../core/config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función para el login con JWT
// authController.js
// authController.js
exports.login = async (req, res) => {
    const { nombre, clave, rol } = req.body;
 
    try {
        const usuario = await db.query('SELECT u.*, e.slug AS restauranteSlug FROM usuarios u JOIN establecimientos e ON u.id_restaurante = e.id WHERE u.nombre = ? AND u.rol = ?', [nombre, rol]);
 
        if (!usuario || usuario.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
 
        const match = await bcrypt.compare(clave, usuario[0].clave);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
 
        const token = jwt.sign({
            id: usuario[0].id,
            nombre: usuario[0].nombre,
            rol: usuario[0].rol,
            id_restaurante: usuario[0].id_restaurante,
            restauranteSlug: usuario[0].restauranteSlug
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
 
        // Redirigir a la URL de retorno si existe
        const redirectUrl = req.session.returnTo || '/'; // Si no hay URL de retorno, redirigir al home
        delete req.session.returnTo; // Limpiar la URL de retorno
        
        res.json({ token, redirectUrl });
 
    } catch (error) {
        console.error('Error al autenticar al usuario:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
 };
 


// Función para verificar el acceso al restaurante
exports.verifyRestaurantAccess = async (req, res, next) => {
    const { id_restaurante } = req.params; // Suponemos que el id del restaurante se pasa en los parámetros
    const userId = req.session.usuario?.id || req.user.id; // Usamos el ID del usuario de la sesión o del token JWT

    try {
        // Consultamos si el usuario tiene acceso al restaurante
        const [usuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [userId]);

        if (!usuario || usuario.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que el restaurante coincide con el acceso del usuario
        if (usuario[0].rol === 'gestor' || usuario[0].id_restaurante === parseInt(id_restaurante)) {
            return next(); // El usuario tiene acceso
        }

        return res.status(403).json({ error: 'Acceso denegado a este restaurante' });

    } catch (error) {
        console.error('Error al verificar el acceso al restaurante:', error);
        return res.status(500).json({ error: 'Error al verificar el acceso al restaurante' });
    }
};


