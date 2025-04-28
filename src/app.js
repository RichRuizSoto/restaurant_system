const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

const errorHandler = require('./middlewares/errorHandler');
const routeConfig = require('./routes/routeConfig');
const configureMiddlewares = require('./middlewares/middlewareConfig');

dotenv.config();

const app = express();

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middleware básico
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware personalizados y rutas
configureMiddlewares(app);
routeConfig(app);

// Manejo de errores
app.use(errorHandler);

module.exports = app;
