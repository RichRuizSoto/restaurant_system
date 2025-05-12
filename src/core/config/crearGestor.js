// scripts/crearGestor.js
require('dotenv').config(); // Carga variables de entorno si las usas
const bcrypt = require('bcrypt');
const pool = require('../../core/config/database');

const crearGestor = async () => {
  const nombre = 'Gestor';
  const clave = 'gestor1234';
  const rol = 'gestor';
  const id_restaurante = 1;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM usuarios WHERE nombre = ? AND rol = ?',
      [nombre, rol]
    );

    if (existe.length > 0) {
      console.log(`❌ El usuario ${nombre} con rol ${rol} ya existe.`);
      process.exit(1);
    }

    const hash = await bcrypt.hash(clave, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (id_restaurante, nombre, rol, clave) VALUES (?, ?, ?, ?)',
      [id_restaurante, nombre, rol, hash]
    );

    console.log(`✅ Usuario gestor creado con ID ${result.insertId}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear el usuario gestor:', err);
    process.exit(1);
  }
};

crearGestor();
