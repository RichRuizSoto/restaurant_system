const express = require('express');
const router = express.Router();
const path = require('path');
const { isAuthenticated, checkRoleAccess } = require('../../middlewares/auth');

router.get('/', isAuthenticated, checkRoleAccess(['gestor']), (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/gestionRestaurantes/gestor.html'));
});

module.exports = router;
