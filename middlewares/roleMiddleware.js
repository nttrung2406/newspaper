export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.session.user.role)) {
        req.flash('error', 'Access denied!');
        return res.redirect('/');
      }
      next();
    };
  };
  