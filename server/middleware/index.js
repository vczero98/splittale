var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

middlewareObj.isLoggedOut = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/write");
}

module.exports = middlewareObj;
