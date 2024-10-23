const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  console.log('Headers:', req.headers); // Add this line
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('No token provided'); // Add this line
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    console.log('Token verified, userId:', req.userId); // Add this line
    next();
  } catch (error) {
    console.log('Token verification failed:', error); // Add this line
    res.status(401).json({ message: 'Token is not valid' });
  }
};
