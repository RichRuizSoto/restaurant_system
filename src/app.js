const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan'); // Importar Morgan

const routeConfig = require('./routes/routeConfig');

dotenv.config();

const app = express();

// Usar Morgan para registrar las peticiones HTTP
app.use(morgan('dev')); // Puedes cambiar 'dev' por otro formato si lo prefieres

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_fallback',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3 * 60000 } 
}));

app.use(express.static(path.join(__dirname, 'public')));

routeConfig(app);

module.exports = app;
