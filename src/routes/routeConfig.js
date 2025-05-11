const productosRoutes = require('./api/productos');
const restauranteRoutes = require('./api/restaurantes');
const gestorRoutes = require('./api/gestores');
const pedidosRoutes = require('./api/pedidos');
const usuariosRoutes = require('./api/usuarios');
const categoriasRoutes = require('./api/categorias');
const gananciasRoutes = require('./api/ganancias');
const authRoutes = require('./api/auth'); // Asegúrate de tener esta ruta

const restauranteViewRoutes = require('./views/restaurantes');
const gestorViewRoutes = require('./views/gestores');
const menuRoutes = require('./views/menu');
const pedidosViewRoutes = require('./views/pedidos');
const authViewRoutes = require('./views/auth');

module.exports = (app) => {
  app.use('/api/auth', authRoutes); // Endpoint para la autenticación
  app.use('/api/gestor', gestorRoutes);
  app.use('/api/productos', productosRoutes);
  app.use('/api/restaurantes', restauranteRoutes);
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/categorias', categoriasRoutes);
  app.use('/api/ganancias', gananciasRoutes);

  app.use('/restaurantes', restauranteViewRoutes);
  app.use('/gestores', gestorViewRoutes);
  app.use('/menu', menuRoutes);
  app.use('/pedidos', pedidosViewRoutes);
  app.use('/auth', authViewRoutes); // Esto habilita la ruta /login
};
