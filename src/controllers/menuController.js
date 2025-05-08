    const restauranteService = require('../services/restaurantesService');
    const productosService = require('../services/productosService');

    // Vista del menú para clientes
    exports.renderizarMenuCliente = async (req, res) => {
    const { slug } = req.params;

    try {
        const restaurante = await restauranteService.obtenerRestaurantePorSlug(slug);

        if (!restaurante) {
        return res.status(404).send('Restaurante no encontrado');
        }

        const productos = await productosService.obtenerProductosPorRestaurante(restaurante.id);
        const productosDisponibles = productos.filter(p => p.disponible === 1);

        // Agrupar productos por categoría
        const productosPorCategoria = {};
        productosDisponibles.forEach(prod => {
          const nombreCategoria = prod.nombre_categoria;
          if (!productosPorCategoria[nombreCategoria]) {
            productosPorCategoria[nombreCategoria] = [];
          }
          productosPorCategoria[nombreCategoria].push(prod);
        });
        

        // Renderizar vista dinámica según restaurante
        res.render('menu', {
            restaurante,
            productosPorCategoria,
            slug // ✅ AÑADIR ESTA LÍNEA
        });
        

    } catch (error) {
        console.error('[renderizarMenuCliente] ❌ Error:', error);
        res.status(500).send('Error al cargar el menú');
    }
    };
