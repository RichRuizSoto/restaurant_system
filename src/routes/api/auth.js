const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../core/config/database'); // Asegúrate de que tu conexión a la base de datos esté configurada correctamente.
const authController = require('../../controllers/authController');

const router = express.Router();

// Usa tu lógica centralizada
router.post('/login', authController.login);

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


