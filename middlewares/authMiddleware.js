export default  (req, res, next) => {
  if (!req.user) {
      return res.status(401).send('Not authorized');
  }
  next(); 
};

// protect routes middleware function
export const protectedRoute = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// guest routes middleware function
export const guestRoute = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
}

export const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error', 'You do not have permission to access this page.');
    return res.redirect('/login');
  }
  next();
};