const express = require('express');

module.exports = (app) => {
  app.use(require('cors')());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
