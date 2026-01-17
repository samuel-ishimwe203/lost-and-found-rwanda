// Middleware to check user roles
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    console.log(`Role check - User role: ${req.user.role}, Allowed: ${allowedRoles.join(', ')}`);

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}, your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Specific role middlewares for convenience
export const adminOnly = checkRole('admin');
export const policeOnly = checkRole('police');
export const loserOnly = checkRole('loser');
export const finderOnly = checkRole('finder');
export const adminOrPolice = checkRole('admin', 'police');
export const loserOrFinder = checkRole('loser', 'finder');
