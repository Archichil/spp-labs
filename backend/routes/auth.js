/**
 * Authentication routes
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenUtils');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser) {
    return res.status(400).json({ 
      message: 'User with this email or username already exists' 
    });
  }

  const userData = {
    username,
    email,
    password,
    role: 'user'
  };
  
  const user = await User.create(userData);
  
  // Generate tokens
  const tokens = generateTokenPair(user._id, user.role);
  
  // Save refresh token
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
  
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required' });
  }

  const user = await User.findOne({ 
    $or: [{ email: identifier }, { username: identifier }]
  }).select('+password');
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await user.comparePassword(password);
  
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate tokens
  const tokens = generateTokenPair(user._id, user.role);
  
  // Save refresh token
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
  
  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  });
}));

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }
  
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findOne({ 
      _id: decoded.userId,
      refreshToken 
    }).select('+refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokenPair(user._id, user.role);

    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
    
    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  
  res.json({ message: 'Logout successful' });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
}));

router.put('/me', authenticate, asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  
  const updates = {};
  if (username) updates.username = username;
  if (email) updates.email = email;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshToken');
  
  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  });
}));

router.put('/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  const user = await User.findById(req.userId).select('+password');

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.json({ message: 'Password changed successfully' });
}));

module.exports = router;