import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

// Authenticate user with JWT
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Access denied.' 
      });
    }

    console.log('Auth middleware - Token found, verifying...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded, user ID:', decoded.id);

    // Get user from database
    const result = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      console.log('Auth middleware - User not found in database');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
    }

    const user = result.rows[0];
    console.log('Auth middleware - User found:', user.email, 'Role:', user.role);

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been deactivated.' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error in authentication',
      error: error.message 
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = result.rows[0];
    }
    
    next();
  } catch (error) {
    // Silently continue if token is invalid for optional auth
    next();
  }
};
