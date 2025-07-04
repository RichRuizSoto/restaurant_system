const express = require('express');
const router = express.Router();
const { isAuthenticated, hasAccessToRestaurant, checkRoleAccess } = require('../../middlewares/auth');

router.get('/:slug/', (req, res) => {
  const { slug } = req.params;
  res.render('empleado', { slug });
});

module.exports = router;