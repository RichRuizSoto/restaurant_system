const pool = require('../core/config/database');  // Asegúrate de que la conexión a la base de datos esté correctamente configurada
const bcrypt = require('bcrypt');

async function encryptPasswords() {
  try {
    // Obtener todos los usuarios con contraseñas no encriptadas
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE clave NOT LIKE "$2b$%"'); // Filtrar solo usuarios con contraseñas sin encriptar

    for (const usuario of usuarios) {
      const claveEncriptada = await bcrypt.hash(usuario.clave, 10); // Encriptar la contraseña

      // Actualizar la contraseña en la base de datos
      await pool.query('UPDATE usuarios SET clave = ? WHERE id = ?', [claveEncriptada, usuario.id]);

      console.log(`Contraseña para ${usuario.nombre} actualizada correctamente.`);
    }

    console.log('Proceso completado');
  } catch (error) {
    console.error('Error al encriptar contraseñas:', error);
  }
}

// Ejecutar el script
encryptPasswords();