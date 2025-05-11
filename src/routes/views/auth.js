// routes/auth.js
const express = require('express');
const router = express.Router();

// Vista de login (GET)
router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
