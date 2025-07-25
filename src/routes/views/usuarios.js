const express = require('express');
const router = express.Router();
const { restrictToOwnRestaurante } = require('../../middleware/restauranteAccess');

router.get('/:slug', restrictToOwnRestaurante, (req, res) => {
  const { slug } = req.params;
  res.render('empleado', { slug });
});

module.exports = router;
