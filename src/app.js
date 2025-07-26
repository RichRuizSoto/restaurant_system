const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan'); // Importar Morgan
const rateLimit = require('express-rate-limit'); // Importar express-rate-limit
const csrf = require('csurf'); // Importar csurf para CSRF Protection

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
  cookie: { maxAge: 0.5 * 60000 } 
}));

// CSRF Protection Middleware
const csrfProtection = csrf({ cookie: true }); // Usamos cookies para almacenar el token CSRF
app.use(csrfProtection);

// Limitar intentos de login (Rate Limiting)
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limita a 5 intentos
  message: 'Demasiados intentos de inicio de sesión, por favor inténtelo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplica el Rate Limiting solo a la ruta de login
app.use('/api/auth/login', loginRateLimiter);

// Rutas y middlewares
app.use(express.static(path.join(__dirname, 'public')));

// Agregar el token CSRF a las vistas (en cada respuesta HTML)
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Esto hace que el token esté disponible en las vistas
  next();
});

routeConfig(app);

module.exports = app;
