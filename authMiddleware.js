const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Middleware to authenticate users
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  // Check if the request header contains an authorization token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract the token from the authorization header
    token = req.headers.authorization.split(' ')[1];
    try {
      // Verify the token and get the decoded user data
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user by ID
        const user = await User.findById(decoded._id);
        // If the user is not found, return an error
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        // Set the user object in the request object and call the next middleware
        req.user = user;
        return next();
      }
    } catch (error) {
      // If the token is invalid, return an error
      throw new Error('Not authorized. Token expired or invalid, please log in again');
    }
  }
  // If the request header doesn't contain an authorization token, return an error
  throw new Error('No token attached to header');
});

// Middleware to check if the user is an admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  // If the user is not an admin, return an error
  if (adminUser.role !== 'admin') {
    return res.status(401).json({ message: 'You are not an admin' });
  }
 
});


module.exports = {authMiddleware, isAdmin};