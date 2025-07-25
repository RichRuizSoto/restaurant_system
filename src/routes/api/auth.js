const express = require('express');
const router = express.Router();
const { obtenerUsuarioPorCredenciales } = require('../../models/Usuarios'); 

router.post('/login', async (req, res) => {
  const { nombre, clave, rol, returnTo } = req.body;

  try {
    // Verificar las credenciales usando la función del modelo
    const usuario = await obtenerUsuarioPorCredenciales(nombre, clave, rol);

    if (usuario) {
      // Guardar usuario en sesión
      req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };

      // Responder con éxito y URL para redirigir
      return res.json({
        success: true,
        redirectUrl: returnTo || '/admin', // Ruta por defecto si no hay returnTo
      });
    }

    // Credenciales inválidas
    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
