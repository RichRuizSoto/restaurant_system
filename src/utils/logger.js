// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',  // Nivel mínimo de logs (info, warn, error)
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),  // Imprime en consola
    new winston.transports.File({ filename: 'logs/app.log' })  // Escribe en un archivo
  ]
});

module.exports = logger;
