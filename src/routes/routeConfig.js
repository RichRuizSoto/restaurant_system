const db = require('../core/config/database'); // Ya tienes la conexión a la base de datos configurada


const productosRoutes = require('./api/productos');
const restauranteRoutes = require('./api/restaurantes');
const gestorRoutes = require('./api/gestores');
const pedidosRoutes = require('./api/pedidos');  // Verifica que esta importación sea correcta
const usuariosRoutes = require('./api/usuarios');  // Verifica que esta importación sea correcta
const categoriasRoutes = require('./api/categoriasRoutes'); // Añadido

const restauranteViewRoutes = require('./views/restaurantes');
const gestorViewRoutes = require('./views/gestores');
const menuRoutes = require('./views/menu');
const pedidosViewRoutes = require('./views/pedidos'); // Corregido


module.exports = (app) => {
  // Rutas API
  app.use('/api/gestor', gestorRoutes);           // Rutas de la API para gestionar establecimientos
  app.use('/api/productos', productosRoutes);     // Rutas de la API para productos
  app.use('/api/restaurantes', restauranteRoutes); // Rutas de la API para restaurantes
  app.use('/api/pedidos', pedidosRoutes);         // Ruta para pedidos
  app.use('/api/usuarios', usuariosRoutes);         // Ruta para pedidos
  app.use('/api/categorias', categoriasRoutes); // Rutas para gestionar categorías

  // Rutas de vistas (compartiendo router)
  app.use('/restaurantes', restauranteViewRoutes);  // Rutas para ver restaurantes (páginas)
  app.use('/gestores', gestorViewRoutes);           // Rutas para la vista de gestores (páginas)
  app.use('/menu', menuRoutes);
  app.use('/pedidos', pedidosViewRoutes);

  app.get('/api/ganancias-por-dia', async (req, res) => {
  const id = req.query.id_restaurante;

  const [rows] = await db.execute(`
    SELECT fecha_creado, SUM(total) AS total_diario
    FROM pedidos
    WHERE estado = 'pagado' AND id_restaurante = ?
    GROUP BY fecha_creado
    ORDER BY fecha_creado ASC
  `, [id]);

  res.json(rows);
});
};
