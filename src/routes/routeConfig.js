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
const adminViewRoutes = require('./views/admin');
const usuariosViewRoutes = require('./views/usuarios');

// Middlewares
const { isAuthenticated } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');



module.exports = (app) => {
  // Rutas públicas (no requieren autenticación)
  app.use('/auth', authViewRoutes);
  app.use('/menu', menuViewRoutes); // Todos los roles y clientes sin login

  app.use('/api/auth', authRoutes);
  
  // Rutas API protegidas
  app.use('/api/productos', isAuthenticated, authorizeRoles('admin', 'gestor'), productosRoutes);
  app.use('/api/restaurantes', isAuthenticated, authorizeRoles('admin', 'gestor'), restauranteRoutes);
  app.use('/api/gestor', isAuthenticated, authorizeRoles('gestor'), gestorRoutes);
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/usuarios', isAuthenticated, authorizeRoles('admin', 'gestor'), usuariosRoutes);
  app.use('/api/categorias', isAuthenticated, authorizeRoles('admin', 'gestor'), categoriasRoutes);
  app.use('/api/ganancias', isAuthenticated, authorizeRoles('admin', 'gestor'), gananciasRoutes);

  // Vistas protegidas
  app.use('/productos', isAuthenticated, authorizeRoles('admin', 'gestor'), restauranteViewRoutes);
  app.use('/gestores', isAuthenticated, authorizeRoles('gestor'), gestorViewRoutes);
  app.use('/pedidos', isAuthenticated, authorizeRoles('admin', 'gestor', 'empleado'), pedidosViewRoutes);
  app.use('/admin', isAuthenticated, authorizeRoles('admin', 'gestor'), adminViewRoutes);
  app.use('/crear-empleado', isAuthenticated, authorizeRoles('admin', 'gestor'), usuariosViewRoutes);

  // Rutas de error y fallback
  app.use('/', errorViewRoutes);
};
