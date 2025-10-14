const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { isValidString, sanitizeString } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, isAdmin, isAdminOrManager } = require('../middleware/auth');
const mongoose = require('mongoose');

/**
 * GET /api/projects
 * Requires authentication
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'user' 
    ? { $or: [{ owner: req.user.id }, { members: req.user.id }] }
    : {};
  
  const projects = await Project.find(filter)
    .populate('owner', 'username email')
    .populate('members', 'username email role')
    .sort({ createdAt: -1 })
    .lean();

  for (const project of projects) {
    const tasks = await Task.find({ project: project._id }).lean();
    project.id = project._id.toString();
    project.tasks = tasks.map(task => ({
      id: task._id.toString(),  
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee,
      attachments: (task.attachments || []).map(att => ({
        id: att._id.toString(),
        filename: att.filename,
        originalName: att.originalName,
        mimetype: att.mimetype,
        size: att.size,
        uploadedAt: att.uploadedAt
      }))
    }));
    delete project._id;
    delete project.__v;
  }
  
  res.json(projects);
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const project = await Project.findById(id)
    .populate('owner', 'username email')
    .populate('members', 'username email role')
    .lean();
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isOwner = project.owner && project.owner._id && project.owner._id.toString() === req.user.id;
  const isMember = project.members && project.members.some(member => 
    member._id && member._id.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const tasks = await Task.find({ project: project._id }).lean();
  
  const response = {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    owner: project.owner ? {
      id: project.owner._id.toString(),
      username: project.owner.username,
      email: project.owner.email
    } : null,
    members: (project.members || []).map(member => ({
      id: member._id.toString(),
      username: member.username,
      email: member.email,
      role: member.role
    })),
    tasks: tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee,
      attachments: (task.attachments || []).map(att => ({
        id: att._id.toString(),
        filename: att.filename,
        originalName: att.originalName,
        mimetype: att.mimetype,
        size: att.size,
        uploadedAt: att.uploadedAt
      }))
    }))
  };
  
  res.json(response);
}));

router.post('/', authenticate, isAdminOrManager, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  if (!isValidString(name)) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const projectData = {
    name: sanitizeString(name),
    description: sanitizeString(description),
    owner: req.user._id,
    members: []
  };
  
  const project = await Project.create(projectData);
  
  const populatedProject = await Project.findById(project._id)
    .populate('owner', 'username email')
    .populate('members', 'username email role')
    .lean();
  
  const response = {
    id: populatedProject._id.toString(),
    name: populatedProject.name,
    description: populatedProject.description,
    owner: populatedProject.owner ? {
      id: populatedProject.owner._id.toString(),
      username: populatedProject.owner.username,
      email: populatedProject.owner.email
    } : null,
    members: [],
    tasks: []
  };
  
  res.status(201).json(response);
}));

router.put('/:id', authenticate, isAdminOrManager, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!isValidString(name)) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const updates = {
    name: sanitizeString(name)
  };
  
  if (description !== undefined) {
    updates.description = sanitizeString(description);
  }
  
  const updatedProject = await Project.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  )
  .populate('owner', 'username email')
  .populate('members', 'username email role')
  .lean();
  
  if (!updatedProject) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const tasks = await Task.find({ project: updatedProject._id }).lean();
  
  const response = {
    id: updatedProject._id.toString(),
    name: updatedProject.name,
    description: updatedProject.description,
    owner: updatedProject.owner ? {
      id: updatedProject.owner._id.toString(),
      username: updatedProject.owner.username,
      email: updatedProject.owner.email
    } : null,
    members: (updatedProject.members || []).map(member => ({
      id: member._id.toString(),
      username: member.username,
      email: member.email,
      role: member.role
    })),
    tasks: tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee
    }))
  };
  
  res.json(response);
}));

router.delete('/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const deletedProject = await Project.findByIdAndDelete(id).lean();
  
  if (!deletedProject) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  // Delete all tasks associated with this project
  await Task.deleteMany({ project: id });
  
  const response = {
    id: deletedProject._id.toString(),
    name: deletedProject.name,
    description: deletedProject.description
  };
  
  res.json(response);
}));

router.post('/:id/members', authenticate, isAdminOrManager, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Valid user ID is required' });
  }
  
  const project = await Project.findById(id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const User = require('../models/User');
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!project.members) {
    project.members = [];
  }

  if (project.members.some(memberId => memberId.toString() === userId)) {
    return res.status(400).json({ message: 'User is already a member of this project' });
  }

  project.members.push(userId);
  await project.save();

  const updatedProject = await Project.findById(id)
    .populate('members', 'username email role')
    .lean();
  
  res.json({
    id: updatedProject._id.toString(),
    name: updatedProject.name,
    description: updatedProject.description,
    members: (updatedProject.members || []).map(member => ({
      id: member._id.toString(),
      username: member.username,
      email: member.email,
      role: member.role
    }))
  });
}));

router.delete('/:id/members/:userId', authenticate, isAdminOrManager, asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  const project = await Project.findById(id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (!project.members) {
    project.members = [];
  }

  project.members = project.members.filter(
    memberId => memberId.toString() !== userId
  );
  await project.save();

  const updatedProject = await Project.findById(id)
    .populate('members', 'username email role')
    .lean();
  
  res.json({
    id: updatedProject._id.toString(),
    name: updatedProject.name,
    description: updatedProject.description,
    members: (updatedProject.members || []).map(member => ({
      id: member._id.toString(),
      username: member.username,
      email: member.email,
      role: member.role
    }))
  });
}));

router.get('/:id/members', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const project = await Project.findById(id)
    .populate('members', 'username email role')
    .lean();
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(member => 
    member._id && member._id.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const members = (project.members || []).map(member => ({
    id: member._id.toString(),
    username: member.username,
    email: member.email,
    role: member.role
  }));
  
  res.json(members);
}));

module.exports = router;