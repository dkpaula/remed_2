const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Check if user has required role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'No user found in request' });
    }

    if (roles.includes(req.user.user_type)) {
      next();
    } else {
      return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }
  };
};

module.exports = {
  verifyToken,
  checkRole
}; 