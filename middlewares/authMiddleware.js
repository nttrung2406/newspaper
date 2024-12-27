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

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    
    // Check if user is logged in
    if (!req.session || !req.session.user) {
      req.flash('error', 'You must be logged in to access this page.');
      return res.redirect('/auth'); 
    }
    // Check if the user's role is in the allowed roles
    const userRole = req.session.user.role;
    if (!allowedRoles.includes(userRole)) {
      req.flash('error', 'You do not have permission to access this page.');
      return res.redirect('/categori'); 
    }
    next();
  };
};

export const authorizeMembership = (allowedMemberships) => {
  return (req, res, next) => {
    // Check if user is logged in
    if (!req.session || !req.session.user) {
      req.flash('error', 'You must be logged in to access this page.');
      return res.redirect('/auth'); 
    }
    const membership = req.session.user.membership;
    console.log(membership);
    if (membership.type==='basic') {
      req.flash('error', 'Access Denied: Youre accessing the premium only content.');
      return res.redirect('/categori'); 
    }
    else if (membership.endDate < Date.now()) {
      req.flash('error', 'Access Denied: Your membership has expired.');
      return res.redirect('/categori'); 
    }
    else if (membership.status === 'inactive') {
      req.flash('error', 'Access Denied: Please contact us to activate youre premium access.');
      return res.redirect('/categori'); 
    }
    next();
  };
}


