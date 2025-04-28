const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const logger = require('./logger');

const PLANTILLA_ORIGEN = path.join(__dirname, '..', '..', 'views', 'templates');  // Carpeta de plantillas
const DESTINO_PUBLIC = path.join(__dirname, '..', 'public');  // Carpeta de destino en public

// Convierte nombre a slug web-friendly (ej: "La Sazón" -> "la-sazon")
const generarSlug = (nombre) => {
  return nombre
    .normalize("NFD") // Elimina tildes
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '') // Quita caracteres especiales
    .trim()
    .replace(/\s+/g, '_') // Usar guion bajo para slugs
    .toLowerCase();
};

// Crear la estructura de archivos para un restaurante
const crearEstructuraRestaurante = async (nombreRestaurante) => {
  const slug = generarSlug(nombreRestaurante);
  const destino = path.join(DESTINO_PUBLIC, slug);

  logger.info(`🟢 Creando carpeta pública para el restaurante: ${slug}`);

  // Verifica si la carpeta ya existe
  try {
    const existeCarpeta = await fse.pathExists(destino);
    if (existeCarpeta) {
      const error = new Error(`La carpeta del restaurante "${slug}" ya existe en /public.`);
      error.status = 400;
      logger.error(`❌ Error: ${error.message}`);
      throw error;
    }
  } catch (err) {
    logger.error(`❌ Error al verificar si existe la carpeta: ${err.message}`);
    throw err;
  }

  // Crear la estructura de archivos
  try {
    await fse.mkdirp(destino); // Crea la carpeta principal del restaurante

    const carpetas = ['admin', 'login', 'menu', 'productos', 'pedidos'];

    for (const carpeta of carpetas) {
      const origenCarpeta = path.join(PLANTILLA_ORIGEN, carpeta);
      const destinoCarpeta = path.join(destino, carpeta);

      try {
        const existeCarpetaOrigen = await fse.pathExists(origenCarpeta);

        if (existeCarpetaOrigen) {
          logger.info(`🔄 Copiando archivos desde: ${origenCarpeta} a ${destinoCarpeta}`);
          await fse.copy(origenCarpeta, destinoCarpeta); // Copia la carpeta y su contenido
        } else {
          logger.warn(`⚠️ No se encontró la carpeta origen: ${origenCarpeta}`);
        }
      } catch (err) {
        logger.error(`❌ Error al copiar la carpeta ${carpeta}: ${err.message}`);
        throw err;
      }
    }

    // 📌 Insertar el slug dinámicamente en productos.html
    const productosHTMLPath = path.join(destino, 'productos', 'productos.html');

    try {
      const existeHTML = await fse.pathExists(productosHTMLPath);

      if (existeHTML) {
        let htmlContent = await fse.readFile(productosHTMLPath, 'utf-8');

        // Corrección del scriptTag para insertar el slug correctamente
        const scriptTag = `<script>const restauranteSlug = "${slug}";</script>\n</body>`;
        htmlContent = htmlContent.replace('</body>', scriptTag); // Insertar el slug antes de cerrar </body>

        await fse.writeFile(productosHTMLPath, htmlContent, 'utf-8');
        logger.info(`✅ Slug insertado dinámicamente en productos.html para ${slug}`);
      } else {
        logger.warn(`⚠️ productos.html no encontrado en ${productosHTMLPath} para insertar el slug`);
      }
    } catch (err) {
      logger.error(`❌ Error al insertar el slug en productos.html: ${err.message}`);
      throw err;
    }

    logger.info(`✅ Estructura de archivos copiada y personalizada en: ${destino}`);
    return slug;
  } catch (err) {
    logger.error(`❌ Error al crear la estructura de archivos: ${err.message}`);
    throw err;
  }
};

// Función para eliminar la estructura de archivos de un restaurante
const eliminarEstructuraRestaurante = async (nombreRestaurante) => {
  const slug = generarSlug(nombreRestaurante);
  const destino = path.join(DESTINO_PUBLIC, slug);

  logger.info(`🛑 Eliminando estructura de archivos para el restaurante: ${slug}`);

  try {
    const existeCarpeta = await fse.pathExists(destino);
    if (!existeCarpeta) {
      const error = new Error(`La carpeta del restaurante "${slug}" no existe en /public.`);
      error.status = 404;
      logger.error(`❌ Error: ${error.message}`);
      throw error;
    }

    // Elimina la carpeta y su contenido
    await fse.remove(destino);
    logger.info(`✅ Estructura de archivos eliminada para el restaurante: ${slug}`);
  } catch (err) {
    logger.error(`❌ Error al eliminar la estructura de archivos: ${err.message}`);
    throw err;
  }
};

module.exports = { crearEstructuraRestaurante, eliminarEstructuraRestaurante };
