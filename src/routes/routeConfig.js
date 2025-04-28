const productosRoutes = require('./api/productos');
const restauranteRoutes = require('./api/restaurantes');
const gestorRoutes = require('./api/gestores');
const pedidosRoutes = require('./api/pedidos');  // Verifica que esta importación sea correcta

const restauranteViewRoutes = require('./views/restaurantes');
const gestorViewRoutes = require('./views/gestores');
const menuRoutes = require('./views/menu');
const pedidosViewRoutes = require('./api/pedidos');  // Verifica que esta importación sea correcta


module.exports = (app) => {
  // Rutas API
  app.use('/api/gestor', gestorRoutes);           // Rutas de la API para gestionar establecimientos
  app.use('/api/productos', productosRoutes);     // Rutas de la API para productos
  app.use('/api/restaurantes', restauranteRoutes); // Rutas de la API para restaurantes
  app.use('/api/pedidos', pedidosRoutes);         // Ruta para pedidos
  
  // Rutas de vistas (compartiendo router)
  app.use('/restaurantes', restauranteViewRoutes);  // Rutas para ver restaurantes (páginas)
  app.use('/gestores', gestorViewRoutes);           // Rutas para la vista de gestores (páginas)
  app.use('/menu', menuRoutes);
//  app.use('/pedidos', pedidosViewRoutes);  // Aquí usas pedidosRoutes en lugar de menuRoutes
};
