const express = require('express');
const router = express.Router();
const gananciasController = require('../../controllers/gananciasController');

router.get('/por-dia', gananciasController.obtenerGananciasPorDia);

module.exports = router;
