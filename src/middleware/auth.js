// src/middleware/auth.js
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/auth/login');
}

module.exports = {
  isAuthenticated,
};
