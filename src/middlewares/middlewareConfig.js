const session = require('express-session');
const express = require('express');
const path = require('path');

module.exports = (app) => {
  app.use(require('cors')());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
    // Middlewares generales
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
  
    // ✅ Configuración de express-session
    app.use(session({
      secret: process.env.SESSION_SECRET || 'clave-secreta',
      resave: false,
      saveUninitialized: false,
      cookie: { 
          secure: false, // En desarrollo, asegúrate de que esté en false
          httpOnly: true, // Mejor seguridad
          maxAge: 10 * 60 * 1000 // 3 minutos
        }
   }));
};
