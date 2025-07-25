const express = require('express');
const router = express.Router();
const { obtenerUsuarioPorCredenciales } = require('../../models/Usuarios'); 

router.post('/login', async (req, res) => {
  const { nombre, clave, rol, returnTo } = req.body;

  try {
    // Verificar las credenciales
    const usuario = await obtenerUsuarioPorCredenciales(nombre, clave, rol);

    if (usuario) {
      // ✅ Guardar datos seguros en sesión
      req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        restauranteId: usuario.id_restaurante, // <-- Esto es necesario para validar el restaurante
      };

      // ✅ Redirección segura
      return res.json({
        success: true,
        redirectUrl: returnTo && returnTo.startsWith('/') ? returnTo : '/admin',
      });
    }

    // ❌ Credenciales inválidas
    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
