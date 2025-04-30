const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization || req.headers['x-auth-token'];
  console.log('Headers:', { authorization: req.headers.authorization, xAuthToken: req.headers['x-auth-token'] });

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
  }
};

exports.adminOnly = async (req, res, next) => {
  const userRole = await User.getRole(req.user.UserID);
  if (userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden - Admins only' });
  }
};

exports.staffOnly = async (req, res, next) => {
  const userRole = await User.getRole(req.user.UserID);
  if (userRole === 'staff') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden - Staff only' });
  }
};