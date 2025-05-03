const express = require('express');
const router = express.Router();
const gestorController = require('../../controllers/gestorController');
const validarRestaurante = require('../../middlewares/validaciones/restauranteValidaciones');
const db = require('../../core/config/database');

// API CRUD de establecimientos
router.post('/crear', validarRestaurante, gestorController.crearRestaurante);
router.get('/establecimientos', gestorController.listarEstablecimientos);
router.get('/establecimientos/:id', gestorController.obtenerEstablecimientoPorId);
router.put('/establecimientos/:id', gestorController.actualizarEstablecimiento);

// Crear administrador (sin encriptación de contraseña por el momento)
router.post('/crearAdministrador', async (req, res) => {
  const { nombreAdmin, claveAdmin, restauranteId } = req.body;

  if (!nombreAdmin || !claveAdmin || !restauranteId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Insertar el nuevo administrador en la base de datos (sin encriptar la clave)
    const query = `
      INSERT INTO usuarios (id_restaurante, nombre, rol, clave)
      VALUES (?, ?, 'admin', ?)
    `;
    const [result] = await db.execute(query, [restauranteId, nombreAdmin, claveAdmin]);

    res.status(201).json({ message: 'Administrador creado con éxito' });
  } catch (err) {
    console.error('[Backend] Error al crear el administrador:', err);
    res.status(500).json({ error: 'Error inesperado al crear el administrador' });
  }
});

// **Leer todos los administradores**
router.get('/administradores', async (req, res) => {
    try {
      const query = `SELECT * FROM usuarios WHERE rol = 'admin'`;
      const [administradores] = await db.execute(query);
      res.status(200).json(administradores);
    } catch (err) {
      console.error('[Backend] Error al obtener administradores:', err);
      res.status(500).json({ error: 'Error inesperado al obtener administradores' });
    }
  });
  
  // **Leer un administrador por ID**
  router.get('/administradores/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const query = `SELECT * FROM usuarios WHERE id = ?`;
      const [admin] = await db.execute(query, [id]);
      
      if (admin.length === 0) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
  
      res.status(200).json(admin[0]);
    } catch (err) {
      console.error('[Backend] Error al obtener administrador:', err);
      res.status(500).json({ error: 'Error inesperado al obtener administrador' });
    }
  });
  
  // **Actualizar un administrador**
router.put('/administradores/:id', async (req, res) => {
    const { id } = req.params;
    const { nombreAdmin, claveAdmin, restauranteId } = req.body;
  
    // Validación de campos
    if (!nombreAdmin || !claveAdmin || !restauranteId) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
  
    try {
      // Aquí se elimina la encriptación de la clave, se guarda tal cual
      const query = `
        UPDATE usuarios 
        SET nombre = ?, clave = ?, id_restaurante = ? 
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [nombreAdmin, claveAdmin, restauranteId, id]);
  
      // Si no se actualiza ningún registro
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
  
      // Respuesta exitosa
      res.status(200).json({ message: 'Administrador actualizado con éxito' });
    } catch (err) {
      console.error('[Backend] Error al actualizar administrador:', err);
      res.status(500).json({ error: 'Error inesperado al actualizar administrador' });
    }
  });
  
  
  // **Eliminar un administrador**
  router.delete('/administradores/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const query = `DELETE FROM usuarios WHERE id = ?`;
      const [result] = await db.execute(query, [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
  
      res.status(200).json({ message: 'Administrador eliminado con éxito' });
    } catch (err) {
      console.error('[Backend] Error al eliminar administrador:', err);
      res.status(500).json({ error: 'Error inesperado al eliminar administrador' });
    }
  });

module.exports = router;
