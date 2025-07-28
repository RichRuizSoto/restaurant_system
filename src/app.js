const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const routeConfig = require('./routes/routeConfig');

dotenv.config();

const app = express();

app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_fallback',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 5 * 60000 }
}));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de inicio de sesión, por favor inténtelo más tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', loginRateLimiter);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

routeConfig(app);

module.exports = app;
