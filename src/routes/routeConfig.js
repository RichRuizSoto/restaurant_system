const productosRoutes = require('./api/productos');
const restauranteRoutes = require('./api/restaurantes');
const gestorRoutes = require('./api/gestores');
const pedidosRoutes = require('./api/pedidos');
const usuariosRoutes = require('./api/usuarios');
const categoriasRoutes = require('./api/categorias');
const gananciasRoutes = require('./api/ganancias');
const authRoutes = require('./api/auth'); 

const restauranteViewRoutes = require('./views/restaurantes');
const gestorViewRoutes = require('./views/gestores');
const menuViewRoutes = require('./views/menu');
const pedidosViewRoutes = require('./views/pedidos');
const authViewRoutes = require('./views/auth');
const errorViewRoutes = require('./views/error');

const {
  isAuthenticated,
  checkRoleAccess
} = require('../middlewares/auth');

module.exports = (app) => {
  // Rutas públicas (no necesitan autenticación)
  app.use('/api/auth', authRoutes);
  app.use('/auth', authViewRoutes);

  // Rutas API protegidas
  app.use('/api/productos', isAuthenticated, checkRoleAccess(['gestor', 'admin']), productosRoutes);
  app.use('/api/restaurantes', isAuthenticated, checkRoleAccess(['gestor', 'admin']), restauranteRoutes);
  app.use('/api/gestor', isAuthenticated, checkRoleAccess(['gestor']), gestorRoutes);
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/usuarios', isAuthenticated, checkRoleAccess(['gestor', 'admin']), usuariosRoutes);
  app.use('/api/categorias', categoriasRoutes);
  app.use('/api/ganancias', isAuthenticated, checkRoleAccess(['gestor', 'admin']), gananciasRoutes);

  // Vistas protegidas
  app.use('/restaurantes', restauranteViewRoutes);
  app.use('/gestores', gestorViewRoutes);
  app.use('/menu', menuViewRoutes);
  app.use('/pedidos', pedidosViewRoutes);

  // Rutas de error
  app.use('/', errorViewRoutes);
};
