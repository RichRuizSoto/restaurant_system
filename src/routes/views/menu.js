const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/menuController');

// /menu/nuevo_restaurante_ejemplo
router.get('/:slug', menuController.renderizarMenuCliente);

module.exports = router;
