const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    const token = authHeader.substring(7);

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.message === 'Invalid or expired access token') {
      return res.status(401).json({ message: 'Invalid or expired token', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.userRole
      });
    }
    
    next();
  };
}

function isAdmin(req, res, next) {
  return authorize('admin')(req, res, next);
}

function isAdminOrManager(req, res, next) {
  return authorize('admin', 'manager')(req, res, next);
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password -refreshToken');
      
      if (user) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next();
}

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isAdminOrManager,
  optionalAuth
};