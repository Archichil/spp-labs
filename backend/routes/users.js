const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .lean();
  
  const response = users.map(user => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));
  
  res.json(response);
}));

router.get('/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id)
    .select('-password -refreshToken')
    .lean();
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  });
}));

router.put('/:id/role', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['user', 'manager', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be user, manager, or admin' });
  }
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user._id.toString() === req.user.id) {
    return res.status(403).json({ message: 'Cannot change your own role' });
  }
  
  user.role = role;
  await user.save();
  
  res.json({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  });
}));

module.exports = router;
