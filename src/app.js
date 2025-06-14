const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middlewares/errorHandler');
const routeConfig = require('./routes/routeConfig');
const configureMiddlewares = require('./middlewares/middlewareConfig');

dotenv.config();

const app = express();

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(express.static(path.join(__dirname, 'public')));

// Configurar middlewares personalizados y rutas
configureMiddlewares(app);
routeConfig(app);

// Middleware para manejo de errores
app.use(errorHandler);

module.exports = app;
