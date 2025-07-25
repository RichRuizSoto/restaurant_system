function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  const returnTo = encodeURIComponent(req.originalUrl);
  return res.redirect(`/auth/login?returnTo=${returnTo}`);
}

module.exports = {
  isAuthenticated,
};
