export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.isLoggedIn || req.session.user.role !== allowedRoles) {
      req.flash("error", "Access denied!");
      return res.redirect("/");
    }
    next();
  };
};