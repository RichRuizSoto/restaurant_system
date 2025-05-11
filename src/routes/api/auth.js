const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../core/config/database'); // Asegúrate de que tu conexión a la base de datos esté configurada correctamente.

const router = express.Router();

router.post('/login', async (req, res) => {
    const { nombre, clave, rol } = req.body;

    try {
        // Consultar el usuario en la base de datos con el nombre y rol proporcionados
        const [user] = await pool.query('SELECT * FROM usuarios WHERE nombre = ? AND rol = ?', [nombre, rol]);

        if (!user || user.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que la clave proporcionada no sea vacía
        if (!clave || !user[0].clave) {
            return res.status(400).json({ error: 'Datos de inicio de sesión incompletos' });
        }

        // Verificar la contraseña con bcrypt
        const match = await bcrypt.compare(clave, user[0].clave);

        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

// Crear el token JWT
const token = jwt.sign(
    { 
        id: user[0].id, 
        nombre: user[0].nombre, 
        rol: user[0].rol, 
        id_restaurante: user[0].id_restaurante 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

// Si el usuario venía desde una página protegida, redirigirla tras login
if (req.session && req.session.returnTo) {
    const redirectTo = req.session.returnTo;
    delete req.session.returnTo; // Limpia la sesión
    return res.status(200).json({ token, redirectTo });
}

// Respuesta estándar
return res.status(200).json({ token });

    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para el registro de usuarios (opcional, según necesidades)
router.post('/register', async (req, res) => {
    const { nombre, clave, rol, id_restaurante } = req.body;

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(clave, 10);

        // Insertar el nuevo usuario en la base de datos
        await pool.query('INSERT INTO usuarios (nombre, clave, rol, id_restaurante) VALUES (?, ?, ?, ?)', 
            [nombre, hashedPassword, rol, id_restaurante]);

        return res.status(201).json({ message: 'Usuario registrado correctamente' });

    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// En tu controlador de logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error al cerrar sesión');
      }
      res.redirect('/login');
    });
  });

module.exports = router;
