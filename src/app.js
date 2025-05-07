const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

const errorHandler = require('./middlewares/errorHandler');
const routeConfig = require('./routes/routeConfig');
const configureMiddlewares = require('./middlewares/middlewareConfig');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

configureMiddlewares(app);
routeConfig(app);

app.use(errorHandler);

module.exports = app;
