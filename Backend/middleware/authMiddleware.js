import jwt from 'jsonwebtoken';
import { executeMysqlQuery } from '../config/db.js';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const usersData = await executeMysqlQuery(`
        SELECT u.*, GROUP_CONCAT(r.role_name) as roles 
        FROM users u 
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
        LEFT JOIN roles r ON ur.role_id = r.role_id 
        WHERE u.user_id = ? 
        GROUP BY u.user_id
      `, [decoded.user_id]);

      if (usersData.length === 0) {
        return res.status(401).json({
          error: 'Not authorized',
          message: 'User not found'
        });
      }

      const userData = usersData[0];
      req.user = new User({
        ...userData,
        roles: userData.roles ? userData.roles.split(',') : []
      });

      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed'
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.roles.includes('admin')) {
    next();
  } else {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
};

export const dealer = (req, res, next) => {
  if (req.user && (req.user.roles.includes('dealer') || req.user.roles.includes('admin'))) {
    next();
  } else {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Dealer access required'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const usersData = await executeMysqlQuery(`
          SELECT u.*, GROUP_CONCAT(r.role_name) as roles 
          FROM users u 
          LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
          LEFT JOIN roles r ON ur.role_id = r.role_id 
          WHERE u.user_id = ? 
          GROUP BY u.user_id
        `, [decoded.user_id]);

        if (usersData.length > 0) {
          const userData = usersData[0];
          req.user = new User({
            ...userData,
            roles: userData.roles ? userData.roles.split(',') : []
          });
        }
      } catch (error) {
        // Token invalid, continue without user
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};